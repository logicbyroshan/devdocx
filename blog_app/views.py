# --- FILE: blog_app/views.py ---

import json
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.db.models import Count
from django.contrib.auth.decorators import login_required
from .forms import NewsletterSubscriberForm
from .models import Post, Tag, Comment


def blog_home_view(request):
    """
    Renders the home page with various sections of posts.
    Optimized with select_related and prefetch_related to avoid N+1 queries.
    """
    # Base queryset for all published and active posts
    all_posts = Post.objects.filter(
        is_active=True, status=Post.Status.PUBLISHED
    ).select_related('author').prefetch_related('tags')

    # Hero section floating cards
    hero_posts = all_posts.order_by('-publish_date')[:3]

    # Trending posts calculated using distinct counts to avoid Cartesian product duplication
    trending_posts = all_posts.annotate(
        engagement=Count('appreciations', distinct=True) + Count('comments', distinct=True)
    ).order_by('-engagement')

    # Latest articles
    latest_posts = all_posts.order_by('-publish_date')[:2]

    # Suggestions
    ai_suggestions = all_posts.order_by('?')[:3]

    # Recommended archive post
    archive_post = all_posts.filter(is_recommended=True).first()

    context = {
        'hero_posts': hero_posts,
        'trending_main': trending_posts.first(),
        'trending_sidebar': list(trending_posts[1:4]),
        'latest_posts': latest_posts,
        'ai_suggestions': ai_suggestions,
        'archive_post': archive_post,
    }
    return render(request, 'blog_app/blog_home.html', context)


def blog_list_view(request):
    """
    Renders the list of all articles, with category filtering and pagination.
    """
    posts_list = Post.objects.filter(
        is_active=True, status=Post.Status.PUBLISHED
    ).select_related('author').prefetch_related('tags')
    categories = Tag.objects.all()

    # Filter posts if a category is specified in the URL query parameters
    category_filter = request.GET.get('category')
    if category_filter and category_filter.lower() != 'all':
        posts_list = posts_list.filter(tags__name__iexact=category_filter)

    # Paginate the results, showing 9 posts per page
    paginator = Paginator(posts_list, 9)
    page_number = request.GET.get('page', 1)
    posts = paginator.get_page(page_number)

    context = {
        'posts': posts,
        'categories': categories,
        'current_category': category_filter,
    }
    return render(request, 'blog_app/blog_list.html', context)


def blog_detail_view(request, slug):
    """
    View for a single blog post with full discussion thread and appreciation state.
    """
    post = get_object_or_404(
        Post.objects.select_related('author').prefetch_related('tags', 'comments__author'),
        slug=slug,
        is_active=True,
        status=Post.Status.PUBLISHED
    )

    # Build absolute URL for thumbnail for SEO/OG tags
    thumbnail_url = None
    if post.thumbnail:
        thumbnail_url = request.build_absolute_uri(post.thumbnail.url)

    # "You Might Also Like" section: find posts with shared tags
    post_tags_ids = post.tags.values_list('id', flat=True)
    related_posts = Post.objects.filter(tags__in=post_tags_ids)\
                                .exclude(id=post.id)\
                                .filter(is_active=True, status=Post.Status.PUBLISHED)\
                                .select_related('author')\
                                .annotate(same_tags=Count('tags'))\
                                .order_by('-same_tags', '-publish_date')[:2]

    user_has_appreciated = False
    if request.user.is_authenticated:
        user_has_appreciated = post.appreciations.filter(id=request.user.id).exists()

    context = {
        'post': post,
        'related_posts': related_posts,
        'og_image_url': thumbnail_url,
        'user_has_appreciated': user_has_appreciated,
    }
    return render(request, 'blog_app/blog_dtl.html', context)


@login_required
def add_comment_view(request, slug):
    """
    Handles submitting a new comment on a blog post.
    Supports standard POST redirects and AJAX JSON responses.
    """
    post = get_object_or_404(Post, slug=slug, is_active=True, status=Post.Status.PUBLISHED)

    if request.method == 'POST':
        body = request.POST.get('body', '').strip()
        if not body:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
                return JsonResponse({'error': 'Comment cannot be empty.'}, status=400)
            messages.error(request, 'Comment cannot be empty.')
            return redirect('blog_app:blog_detail', slug=slug)

        comment = Comment.objects.create(
            post=post,
            author=request.user,
            body=body
        )

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
            return JsonResponse({
                'success': True,
                'comment': {
                    'id': comment.id,
                    'author': comment.author.username,
                    'body': comment.body,
                    'created_at': comment.created_at.strftime('%b %d, %Y'),
                },
                'total_comments': post.comments.count(),
            })

        messages.success(request, 'Your comment has been posted!')
        return redirect('blog_app:blog_detail', slug=slug)

    return redirect('blog_app:blog_detail', slug=slug)


@login_required
def toggle_appreciation_view(request, slug):
    """
    Toggles the appreciation (like) for the current user on a post.
    Supports standard POST redirects and AJAX JSON responses.
    """
    post = get_object_or_404(Post, slug=slug, is_active=True, status=Post.Status.PUBLISHED)

    if request.method == 'POST':
        user = request.user
        if post.appreciations.filter(id=user.id).exists():
            post.appreciations.remove(user)
            appreciated = False
        else:
            post.appreciations.add(user)
            appreciated = True

        total_appreciations = post.appreciations.count()

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
            return JsonResponse({
                'success': True,
                'appreciated': appreciated,
                'total_appreciations': total_appreciations
            })

        return redirect('blog_app:blog_detail', slug=slug)

    return redirect('blog_app:blog_detail', slug=slug)


def about_author_view(request):
    """
    Renders the static 'About Me' page.
    """
    return render(request, 'blog_app/about_author.html')


def subscribe_view(request):
    """
    Handles newsletter subscription form submission.
    """
    if request.method == 'POST':
        next_page = request.POST.get('next', '/')
        form = NewsletterSubscriberForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, 'Thank you for subscribing!')
            except IntegrityError:
                messages.warning(request, 'This email is already subscribed. Thank you!')
        else:
            messages.error(request, 'Please enter a valid email address.')

        return redirect(next_page)

    return redirect('blog_app:home')