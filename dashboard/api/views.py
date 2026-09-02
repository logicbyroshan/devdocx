# --- FILE: admin_app/api/views.py ---

import calendar
from collections import defaultdict
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from articles.models import Post, Tag, Comment, NewsletterSubscriber

from .serializers import (
    AdminPostListSerializer,
    AdminPostDetailSerializer,
    AdminCommentSerializer,
    AdminSubscriberSerializer,
    AdminUserSerializer,
)


class AdminDashboardAPIView(APIView):
    """Returns dashboard metrics, performance chart data, calendar, and planned ideas."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        published_count = Post.objects.filter(status=Post.Status.PUBLISHED).count()
        scheduled_count = Post.objects.filter(status=Post.Status.SCHEDULED).count()
        draft_count = Post.objects.filter(status=Post.Status.DRAFT).count()
        planned_count = Post.objects.filter(status=Post.Status.PLANNED).count()

        planned_posts = Post.objects.filter(status=Post.Status.PLANNED).order_by('-created_at')[:10]

        # Chart Data
        recent_posts = Post.objects.filter(
            status=Post.Status.PUBLISHED
        ).prefetch_related('appreciations', 'comments').order_by('-publish_date')[:5]

        chart_labels = [p.title[:22] + ('...' if len(p.title) > 22 else '') for p in recent_posts]
        chart_views = [p.total_appreciations * 20 + 100 for p in recent_posts]
        chart_appreciations = [p.total_appreciations for p in recent_posts]
        chart_comments = [p.comments.count() for p in recent_posts]

        chart_data = {
            'labels': chart_labels,
            'datasets': [
                {'label': 'Estimated Views', 'data': chart_views, 'color': '#22d3ee'},
                {'label': 'Appreciations', 'data': chart_appreciations, 'color': '#14b8a6'},
                {'label': 'Comments', 'data': chart_comments, 'color': '#64748b'},
            ]
        }

        # Editorial Calendar Data (Single-query mapped by date)
        today = timezone.now()
        cal = calendar.Calendar()
        month_calendar = cal.monthdatescalendar(today.year, today.month)
        min_date = month_calendar[0][0]
        max_date = month_calendar[-1][-1]

        calendar_posts_qs = Post.objects.filter(
            publish_date__date__gte=min_date,
            publish_date__date__lte=max_date,
            status__in=[Post.Status.PUBLISHED, Post.Status.SCHEDULED]
        )

        posts_by_date = defaultdict(list)
        for p in calendar_posts_qs:
            posts_by_date[p.publish_date.date()].append({
                'id': p.id,
                'title': p.title,
                'status': p.status,
                'status_display': p.get_status_display(),
            })

        calendar_weeks = []
        for week in month_calendar:
            week_days = []
            for day_date in week:
                week_days.append({
                    'day': day_date.day if day_date.month == today.month else 0,
                    'date_str': day_date.isoformat(),
                    'is_current_month': day_date.month == today.month,
                    'is_today': day_date == today.date(),
                    'posts': posts_by_date.get(day_date, []),
                })
            calendar_weeks.append(week_days)

        # Tabbed Lists
        published_qs = Post.objects.filter(status=Post.Status.PUBLISHED)
        popular_posts = published_qs.annotate(
            engagement=Count('appreciations', distinct=True) + Count('comments', distinct=True)
        ).order_by('-engagement')[:5]
        latest_posts = published_qs.order_by('-publish_date')[:5]
        recommended_posts = published_qs.filter(is_recommended=True)[:5]
        non_recommended_posts = published_qs.filter(is_recommended=False)[:20]

        context = {'request': request}
        return Response({
            'success': True,
            'metrics': {
                'published_count': published_count,
                'scheduled_count': scheduled_count,
                'draft_count': draft_count,
                'planned_count': planned_count,
            },
            'chart_data': chart_data,
            'calendar': {
                'month_name': today.strftime('%B'),
                'year': today.year,
                'weeks': calendar_weeks,
            },
            'planned_posts': AdminPostListSerializer(planned_posts, many=True, context=context).data,
            'popular_posts': AdminPostListSerializer(popular_posts, many=True, context=context).data,
            'latest_posts': AdminPostListSerializer(latest_posts, many=True, context=context).data,
            'recommended_posts': AdminPostListSerializer(recommended_posts, many=True, context=context).data,
            'non_recommended_posts': AdminPostListSerializer(non_recommended_posts, many=True, context=context).data,
        })


class AdminPostListCreateAPIView(APIView):
    """Lists posts with status filter and creates new articles."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_param = request.GET.get('status', 'all').upper()
        search = request.GET.get('search')

        posts = Post.objects.select_related('author').prefetch_related('tags').annotate(
            total_appr=Count('appreciations', distinct=True)
        ).order_by('-publish_date', '-created_at')

        if status_param in ['PB', 'SC', 'DF', 'PL']:
            posts = posts.filter(status=status_param)
        elif status_param == 'PUBLISHED':
            posts = posts.filter(status=Post.Status.PUBLISHED)
        elif status_param == 'SCHEDULED':
            posts = posts.filter(status=Post.Status.SCHEDULED)
        elif status_param == 'DRAFT':
            posts = posts.filter(status=Post.Status.DRAFT)
        elif status_param == 'PLANNED':
            posts = posts.filter(status=Post.Status.PLANNED)

        if search:
            posts = posts.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        serializer = AdminPostListSerializer(posts, many=True, context={'request': request})
        return Response({'success': True, 'posts': serializer.data})

    def post(self, request):
        title = request.data.get('title', '').strip()
        if not title:
            return Response({'success': False, 'message': 'Post title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action', 'draft').lower()
        if action == 'publish':
            post_status = Post.Status.PUBLISHED
            publish_date = timezone.now()
        elif action == 'schedule':
            post_status = Post.Status.SCHEDULED
            schedule_date_str = request.data.get('schedule_date')
            parsed_date = parse_datetime(schedule_date_str) if schedule_date_str else None
            publish_date = parsed_date if parsed_date else (timezone.now() + timezone.timedelta(days=7))
        else:
            post_status = Post.Status.DRAFT
            publish_date = timezone.now()

        # Build unique slug
        base_slug = slugify(title) or 'post'
        slug = base_slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        post = Post.objects.create(
            author=request.user,
            title=title,
            subtitle=request.data.get('subtitle', ''),
            slug=slug,
            content=request.data.get('content', ''),
            meta_description=request.data.get('meta_description', ''),
            status=post_status,
            publish_date=publish_date,
        )

        if 'thumbnail' in request.FILES:
            post.thumbnail = request.FILES['thumbnail']
            post.save()

        tags_raw = request.data.get('tags', '')
        if isinstance(tags_raw, str):
            tag_names = [t.strip() for t in tags_raw.split(',') if t.strip()]
        elif isinstance(tags_raw, list):
            tag_names = [str(t).strip() for t in tags_raw if str(t).strip()]
        else:
            tag_names = []

        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            post.tags.add(tag)

        return Response({
            'success': True,
            'message': f'Post "{post.title}" created successfully!',
            'post': AdminPostDetailSerializer(post, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class AdminPostDetailAPIView(APIView):
    """Retrieves, updates, or deletes a specific post."""
    permission_classes = [IsAdminUser]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = AdminPostDetailSerializer(post, context={'request': request})
        return Response({'success': True, 'post': serializer.data})

    def patch(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)

        title = request.data.get('title', post.title).strip()
        if not title:
            return Response({'success': False, 'message': 'Title cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')
        if action == 'publish':
            post.status = Post.Status.PUBLISHED
            if not post.publish_date or post.status != Post.Status.PUBLISHED:
                post.publish_date = timezone.now()
        elif action == 'schedule':
            post.status = Post.Status.SCHEDULED
            schedule_date_str = request.data.get('schedule_date')
            parsed_date = parse_datetime(schedule_date_str) if schedule_date_str else None
            post.publish_date = parsed_date if parsed_date else (timezone.now() + timezone.timedelta(days=7))
        elif action == 'draft':
            post.status = Post.Status.DRAFT

        # Check slug if title changed
        if title != post.title:
            base_slug = slugify(title) or 'post'
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exclude(pk=post.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            post.slug = slug

        post.title = title
        if 'subtitle' in request.data:
            post.subtitle = request.data.get('subtitle', '')
        if 'content' in request.data:
            post.content = request.data.get('content', '')
        if 'meta_description' in request.data:
            post.meta_description = request.data.get('meta_description', '')

        if 'thumbnail' in request.FILES:
            post.thumbnail = request.FILES['thumbnail']

        post.save()

        if 'tags' in request.data:
            post.tags.clear()
            tags_raw = request.data.get('tags', '')
            if isinstance(tags_raw, str):
                tag_names = [t.strip() for t in tags_raw.split(',') if t.strip()]
            elif isinstance(tags_raw, list):
                tag_names = [str(t).strip() for t in tags_raw if str(t).strip()]
            else:
                tag_names = []

            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                post.tags.add(tag)

        return Response({
            'success': True,
            'message': f'Post "{post.title}" updated successfully!',
            'post': AdminPostDetailSerializer(post, context={'request': request}).data
        })

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        title = post.title
        post.delete()
        return Response({'success': True, 'message': f'Post "{title}" deleted successfully.'})


class AdminTogglePostActiveAPIView(APIView):
    """Toggles active visibility state for a post."""
    permission_classes = [IsAdminUser]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        post.is_active = not post.is_active
        post.save()
        return Response({
            'success': True,
            'is_active': post.is_active,
            'message': f'Post visibility is now {"Active" if post.is_active else "Hidden"}.'
        })


class AdminTogglePostRecommendAPIView(APIView):
    """Toggles recommendation status for spotlight/archives."""
    permission_classes = [IsAdminUser]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        post.is_recommended = not post.is_recommended
        post.save()
        return Response({
            'success': True,
            'is_recommended': post.is_recommended,
            'message': f'Post "{post.title}" is {"now recommended" if post.is_recommended else "no longer recommended"}.'
        })


class AdminPlanPostAPIView(APIView):
    """Quickly saves a planned blog idea."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        title = request.data.get('title', '').strip()
        if not title:
            return Response({'success': False, 'message': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        base_slug = slugify(title) or 'planned-post'
        slug = base_slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        post = Post.objects.create(
            author=request.user,
            title=title,
            slug=slug,
            status=Post.Status.PLANNED
        )
        return Response({
            'success': True,
            'message': f'Idea "{title}" planned successfully!',
            'post': AdminPostListSerializer(post, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class AdminActivityAPIView(APIView):
    """Returns community metrics, registered users, newsletter subscribers, and comment moderation list."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        all_posts_with_comments = Post.objects.filter(comments__isnull=False).distinct().values('id', 'title')
        selected_post_id = request.GET.get('post_id')

        comments = Comment.objects.select_related('post', 'author').order_by('-is_pinned', '-created_at')
        if selected_post_id:
            comments = comments.filter(post__id=selected_post_id)

        users = User.objects.all().order_by('-date_joined')
        subscribers = NewsletterSubscriber.objects.all().order_by('-subscribed_at')

        total_appreciations = sum(p.total_appreciations for p in Post.objects.all())

        return Response({
            'success': True,
            'stats': {
                'total_appreciations': total_appreciations,
                'total_comments': Comment.objects.count(),
                'registered_users_count': users.count(),
                'subscribers_count': subscribers.count(),
            },
            'posts_with_comments': list(all_posts_with_comments),
            'comments': AdminCommentSerializer(comments, many=True).data,
            'registered_users': AdminUserSerializer(users, many=True).data,
            'subscribers': AdminSubscriberSerializer(subscribers, many=True).data,
        })


class AdminTogglePinCommentAPIView(APIView):
    """Toggles pin status of a comment."""
    permission_classes = [IsAdminUser]

    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        comment.is_pinned = not comment.is_pinned
        comment.save()
        return Response({
            'success': True,
            'is_pinned': comment.is_pinned,
            'message': f'Comment {"pinned to top" if comment.is_pinned else "unpinned"}.'
        })


class AdminDeleteCommentAPIView(APIView):
    """Moderates/deletes a comment."""
    permission_classes = [IsAdminUser]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        comment.delete()
        return Response({'success': True, 'message': 'Comment deleted successfully.'})
