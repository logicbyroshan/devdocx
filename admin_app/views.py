# --- FILE: admin_app/views.py ---

import calendar
from collections import defaultdict
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Count, Q
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.text import slugify
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.contrib import messages
from django.contrib.auth.models import User
from blog_app.models import Post, Comment, NewsletterSubscriber, Tag


def is_staff(user):
    """Check to ensure only staff members can access the admin panel."""
    return user.is_authenticated and user.is_staff


# ==============================================================================
# Dashboard Views & Actions
# ==============================================================================

@login_required
@user_passes_test(is_staff)
def dashboard_view(request):
    """
    Renders the main admin dashboard with statistics, charts, and overviews.
    Optimized calendar querying to eliminate N+1 SQL queries.
    """
    # Card Statistics
    published_count = Post.objects.filter(status=Post.Status.PUBLISHED).count()
    scheduled_count = Post.objects.filter(status=Post.Status.SCHEDULED).count()
    draft_count = Post.objects.filter(status=Post.Status.DRAFT).count()

    # Planned Posts Section
    planned_posts = Post.objects.filter(status=Post.Status.PLANNED).order_by('-created_at')

    # Performance Chart Data
    recent_posts_for_chart = Post.objects.filter(
        status=Post.Status.PUBLISHED
    ).prefetch_related('appreciations', 'comments').order_by('-publish_date')[:3]

    chart_labels = [post.title[:20] + ('...' if len(post.title) > 20 else '') for post in recent_posts_for_chart]
    chart_views = [post.total_appreciations * 20 + 100 for post in recent_posts_for_chart]
    chart_appreciations = [post.total_appreciations for post in recent_posts_for_chart]
    chart_comments = [post.comments.count() for post in recent_posts_for_chart]

    chart_data = {
        'labels': chart_labels,
        'datasets': [
            {'label': 'Views', 'data': chart_views, 'backgroundColor': '#22d3ee', 'borderRadius': 4},
            {'label': 'Appreciations', 'data': chart_appreciations, 'backgroundColor': '#14b8a6', 'borderRadius': 4},
            {'label': 'Comments', 'data': chart_comments, 'backgroundColor': '#64748b', 'borderRadius': 4}
        ]
    }

    # High-Performance Editorial Calendar Logic (Single Query)
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
    for post in calendar_posts_qs:
        posts_by_date[post.publish_date.date()].append(post)

    calendar_weeks = []
    for week in month_calendar:
        week_with_posts = []
        for day_date in week:
            day_number = day_date.day if day_date.month == today.month else 0
            posts_on_day = posts_by_date.get(day_date, [])
            week_with_posts.append((day_number, posts_on_day))
        calendar_weeks.append(week_with_posts)

    # Tabbed Lists Data
    published_posts_qs = Post.objects.filter(status=Post.Status.PUBLISHED)
    popular_posts = published_posts_qs.annotate(
        engagement=Count('appreciations', distinct=True) + Count('comments', distinct=True)
    ).order_by('-engagement')[:5]
    latest_posts = published_posts_qs.order_by('-publish_date')[:5]
    recommended_posts = published_posts_qs.filter(is_recommended=True)
    non_recommended_posts = published_posts_qs.filter(is_recommended=False)

    context = {
        'published_count': published_count,
        'scheduled_count': scheduled_count,
        'draft_count': draft_count,
        'planned_posts': planned_posts,
        'chart_data': chart_data,
        'calendar_weeks': calendar_weeks,
        'calendar_month_name': today.strftime('%B'),
        'calendar_year': today.year,
        'popular_posts': popular_posts,
        'latest_posts': latest_posts,
        'recommended_posts': recommended_posts,
        'non_recommended_posts': non_recommended_posts,
    }
    return render(request, 'admin_app/admin-dash.html', context)


@login_required
@user_passes_test(is_staff)
def plan_blog_view(request):
    """Handles the form submission for 'Plan a New Blog'."""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        if title:
            base_slug = slugify(title) or 'planned-post'
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            Post.objects.create(
                author=request.user,
                title=title,
                slug=slug,
                status=Post.Status.PLANNED
            )
            messages.success(request, f'Idea "{title}" planned successfully!')
        else:
            messages.error(request, 'Please enter a title for the planned post.')
    return redirect('admin_app:dashboard')


@login_required
@user_passes_test(is_staff)
def recommend_blog_view(request):
    """Handles recommending or un-recommending a blog post."""
    if request.method == 'POST':
        post_id_to_recommend = request.POST.get('post_to_recommend')
        post_id_to_unrecommend = request.POST.get('post_to_unrecommend')

        if post_id_to_recommend:
            post = get_object_or_404(Post, id=post_id_to_recommend)
            post.is_recommended = True
            post.save()
            messages.success(request, f'Post "{post.title}" is now recommended.')

        if post_id_to_unrecommend:
            post = get_object_or_404(Post, id=post_id_to_unrecommend)
            post.is_recommended = False
            post.save()
            messages.info(request, f'Post "{post.title}" removed from recommended.')

    return redirect('admin_app:dashboard')


# ==============================================================================
# Blog List Views & Actions
# ==============================================================================

@login_required
@user_passes_test(is_staff)
def blog_list_view(request):
    """Displays lists of all posts, categorized by their status."""
    context = {
        'published_posts': Post.objects.filter(status=Post.Status.PUBLISHED).order_by('-publish_date'),
        'scheduled_posts': Post.objects.filter(status=Post.Status.SCHEDULED).order_by('publish_date'),
        'draft_posts': Post.objects.filter(status=Post.Status.DRAFT).order_by('-updated_at'),
    }
    return render(request, 'admin_app/blog_list.html', context)


@login_required
@user_passes_test(is_staff)
def toggle_post_active_view(request, post_id):
    """Toggles the is_active boolean field for a given post."""
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        post.is_active = not post.is_active
        post.save()
        messages.success(request, f'Post visibility updated.')
    return redirect('admin_app:blog_list')


@login_required
@user_passes_test(is_staff)
def delete_post_view(request, post_id):
    """Deletes a post."""
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        title = post.title
        post.delete()
        messages.success(request, f'Post "{title}" was deleted.')

    next_url = request.POST.get('next') or request.META.get('HTTP_REFERER')
    if next_url and 'dashboard' in next_url:
        return redirect('admin_app:dashboard')
    return redirect('admin_app:blog_list')


# ==============================================================================
# Blog Activity Views & Actions
# ==============================================================================

@login_required
@user_passes_test(is_staff)
def blog_activity_view(request):
    """Shows community activity and handles comment filtering."""
    all_posts_with_comments = Post.objects.filter(comments__isnull=False).distinct()
    selected_post_id = request.GET.get('post_id')
    comments = Comment.objects.select_related('post', 'author').order_by('-is_pinned', '-created_at')

    if selected_post_id:
        comments = comments.filter(post__id=selected_post_id)

    total_appreciations = sum(p.total_appreciations for p in Post.objects.all())

    context = {
        'total_appreciations': total_appreciations,
        'total_comments': Comment.objects.count(),
        'registered_users': User.objects.all().order_by('-date_joined'),
        'subscribers': NewsletterSubscriber.objects.all().order_by('-subscribed_at'),
        'all_posts_with_comments': all_posts_with_comments,
        'comments': comments,
        'selected_post_id': selected_post_id,
    }
    return render(request, 'admin_app/blog_activity.html', context)


@login_required
@user_passes_test(is_staff)
def toggle_pin_comment_view(request, comment_id):
    """Toggles the is_pinned boolean field for a given comment."""
    if request.method == 'POST':
        comment = get_object_or_404(Comment, id=comment_id)
        comment.is_pinned = not comment.is_pinned
        comment.save()

    redirect_url = redirect('admin_app:activity').url
    if post_id := request.POST.get('post_id'):
        redirect_url += f'?post_id={post_id}'
    return redirect(redirect_url)


@login_required
@user_passes_test(is_staff)
def delete_comment_view(request, comment_id):
    """Deletes a comment."""
    if request.method == 'POST':
        comment = get_object_or_404(Comment, id=comment_id)
        comment.delete()
        messages.success(request, 'Comment deleted successfully.')

    redirect_url = redirect('admin_app:activity').url
    if post_id := request.POST.get('post_id'):
        redirect_url += f'?post_id={post_id}'
    return redirect(redirect_url)


# ==============================================================================
# Blog Editor View
# ==============================================================================

@login_required
@user_passes_test(is_staff)
def write_blog_view(request, post_id=None):
    """Handles creating a new blog post and editing an existing one."""
    post = get_object_or_404(Post, id=post_id) if post_id else None

    if request.method == 'POST':
        title = request.POST.get('blog-title', '').strip()
        if not title:
            messages.error(request, 'Blog title is required.')
            return render(request, 'admin_app/write_blog.html', {'post': post})

        action = request.POST.get('action')

        if action == 'publish':
            status = Post.Status.PUBLISHED
            publish_date = timezone.now()
        elif action == 'schedule':
            status = Post.Status.SCHEDULED
            schedule_date_str = request.POST.get('schedule-date')
            parsed_date = parse_datetime(schedule_date_str) if schedule_date_str else None
            publish_date = parsed_date if parsed_date else (timezone.now() + timezone.timedelta(days=7))
        else:
            status = Post.Status.DRAFT
            publish_date = post.publish_date if post and post.publish_date else timezone.now()

        # Build unique slug
        base_slug = slugify(title) or 'post'
        slug = base_slug
        counter = 1
        existing_slug_qs = Post.objects.filter(slug=slug)
        if post:
            existing_slug_qs = existing_slug_qs.exclude(pk=post.pk)
        while existing_slug_qs.exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
            existing_slug_qs = Post.objects.filter(slug=slug)
            if post:
                existing_slug_qs = existing_slug_qs.exclude(pk=post.pk)

        if post:
            post.title = title
            post.subtitle = request.POST.get('blog-subtitle', '')
            post.slug = slug
            post.content = request.POST.get('blog-editor-content', '')
            post.meta_description = request.POST.get('meta-description', '')
            post.status = status
            post.publish_date = publish_date
            post.save()
        else:
            post = Post.objects.create(
                author=request.user,
                title=title,
                subtitle=request.POST.get('blog-subtitle', ''),
                slug=slug,
                content=request.POST.get('blog-editor-content', ''),
                meta_description=request.POST.get('meta-description', ''),
                status=status,
                publish_date=publish_date,
            )

        if 'blog-thumbnail' in request.FILES:
            post.thumbnail = request.FILES['blog-thumbnail']
            post.save()

        post.tags.clear()
        if tags_string := request.POST.get('blog-tags'):
            for tag_name in [name.strip() for name in tags_string.split(',') if name.strip()]:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                post.tags.add(tag)

        messages.success(request, f'Post "{post.title}" saved successfully!')
        return redirect('admin_app:blog_list')

    return render(request, 'admin_app/write_blog.html', {'post': post})