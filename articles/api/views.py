# --- FILE: blog_app/api/views.py ---

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from articles.models import Post, Tag, Comment, NewsletterSubscriber

from .serializers import (
    TagSerializer,
    CommentSerializer,
    PostListSerializer,
    PostDetailSerializer,
    AddCommentSerializer,
    NewsletterSubscriberSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50


class BlogHomeAPIView(APIView):
    """Aggregate endpoint returning structured sections for the modern homepage."""
    permission_classes = [AllowAny]

    def get(self, request):
        all_posts = Post.objects.filter(
            is_active=True, status=Post.Status.PUBLISHED
        ).select_related('author').prefetch_related('tags').annotate(
            annotated_likes=Count('appreciations', distinct=True)
        )

        hero_posts = all_posts.order_by('-publish_date')[:3]

        trending_posts = all_posts.annotate(
            engagement=Count('appreciations', distinct=True) + Count('comments', distinct=True)
        ).order_by('-engagement')

        trending_main = trending_posts.first()
        trending_sidebar = list(trending_posts[1:4]) if trending_posts.count() > 1 else []

        latest_posts = all_posts.order_by('-publish_date')[:4]
        ai_suggestions = all_posts.order_by('?')[:3]
        archive_post = all_posts.filter(is_recommended=True).first() or all_posts.order_by('publish_date').first()

        context = {'request': request}
        return Response({
            'success': True,
            'hero_posts': PostListSerializer(hero_posts, many=True, context=context).data,
            'trending_main': PostListSerializer(trending_main, context=context).data if trending_main else None,
            'trending_sidebar': PostListSerializer(trending_sidebar, many=True, context=context).data,
            'latest_posts': PostListSerializer(latest_posts, many=True, context=context).data,
            'ai_suggestions': PostListSerializer(ai_suggestions, many=True, context=context).data,
            'archive_post': PostListSerializer(archive_post, context=context).data if archive_post else None,
        })


class PostListAPIView(APIView):
    """List of all published articles with category filter, search, and pagination."""
    permission_classes = [AllowAny]

    def get(self, request):
        posts = Post.objects.filter(
            is_active=True, status=Post.Status.PUBLISHED
        ).select_related('author').prefetch_related('tags').annotate(
            annotated_likes=Count('appreciations', distinct=True)
        ).order_by('-publish_date', '-created_at')


        category = request.GET.get('category')
        if category and category.lower() != 'all':
            posts = posts.filter(tags__name__iexact=category)

        search = request.GET.get('search')
        if search:
            posts = posts.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(content__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        paginator = StandardResultsSetPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostListSerializer(paginated_posts, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class PostDetailAPIView(APIView):
    """Retrieves full article details by slug."""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        post = get_object_or_404(
            Post.objects.select_related('author').prefetch_related('tags', 'comments__author'),
            slug=slug,
            is_active=True,
            status=Post.Status.PUBLISHED
        )
        serializer = PostDetailSerializer(post, context={'request': request})
        return Response({'success': True, 'post': serializer.data})


class ToggleAppreciationAPIView(APIView):
    """Toggles heart/like for authenticated user on post."""
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = get_object_or_404(Post, slug=slug, is_active=True, status=Post.Status.PUBLISHED)
        user = request.user

        if post.appreciations.filter(id=user.id).exists():
            post.appreciations.remove(user)
            appreciated = False
        else:
            post.appreciations.add(user)
            appreciated = True

        return Response({
            'success': True,
            'appreciated': appreciated,
            'total_appreciations': post.appreciations.count()
        })


class AddCommentAPIView(APIView):
    """Adds a new comment on the article."""
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = get_object_or_404(Post, slug=slug, is_active=True, status=Post.Status.PUBLISHED)
        serializer = AddCommentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            post=post,
            author=request.user,
            body=serializer.validated_data['body']
        )

        return Response({
            'success': True,
            'comment': CommentSerializer(comment).data,
            'total_comments': post.comments.count()
        }, status=status.HTTP_201_CREATED)


class CategoryListAPIView(APIView):
    """Lists all available categories/tags."""
    permission_classes = [AllowAny]

    def get(self, request):
        tags = Tag.objects.all().order_by('name')
        return Response({
            'success': True,
            'categories': TagSerializer(tags, many=True).data
        })


class NewsletterSubscribeAPIView(APIView):
    """Handles newsletter subscriptions."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewsletterSubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Thank you for subscribing to our newsletter!'})
        elif 'email' in serializer.errors and 'already exists' in str(serializer.errors['email']):
            return Response({'success': True, 'message': 'You are already subscribed. Thank you!'})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AboutAuthorAPIView(APIView):
    """Returns information for the about/author page."""
    permission_classes = [AllowAny]

    def get(self, request):
        total_posts = Post.objects.filter(is_active=True, status=Post.Status.PUBLISHED).count()
        total_likes = sum(p.total_appreciations for p in Post.objects.all())
        total_comments = Comment.objects.count()

        return Response({
            'success': True,
            'author': {
                'name': 'DevDocs Engineering',
                'title': 'Technical Systems & Developer Platform',
                'bio': 'Dedicated to building robust, high-throughput distributed systems, clean decoupled architectures, and state-of-the-art developer documentation.',
                'avatar_url': 'https://ui-avatars.com/api/?name=DevDocs+Engineering&background=0f172a&color=22d3ee&size=200',
                'location': 'Global',
                'skills': ['Python', 'Django 5.2', 'React.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'System Architecture', 'REST APIs'],
                'metrics': {
                    'total_articles': total_posts,
                    'total_appreciations': total_likes,
                    'total_comments': total_comments,
                },
                'social_links': {
                    'github': 'https://github.com/logicbyroshan/blog-website-react',
                    'linkedin': 'https://linkedin.com',
                    'twitter': 'https://twitter.com',
                }
            }
        })



DOCS_CATALOG = [
    {
        'slug': 'system-architecture',
        'title': 'System Architecture & Data Flow',
        'category': 'Architecture',
        'description': 'High-level architectural blueprint separating the React.js client presentation layer from Django business logic.',
        'updated_at': '2026-09-02',
        'read_time': '5 min read',
        'toc': [
            {'id': 'overview', 'title': 'Architectural Overview'},
            {'id': 'data-flow', 'title': 'End-to-End Data Flow'},
            {'id': 'sequence-diagram', 'title': 'Authentication & Request Sequence'},
            {'id': 'key-principles', 'title': 'Key Architectural Principles'},
        ],
        'content': """# System Architecture & Data Flow

The platform operates as a decoupled, high-performance web system combining a modern **React.js SPA** frontend with a robust, authoritative **Django REST Framework** backend.

:::note
**Source of Truth:** Django remains the absolute source of truth for authentication, permissions, data validation, database persistence, and background workflows. React is solely responsible for presentation, client-side routing, interaction, and state management.
:::

## Architectural Overview

```mermaid
graph TD
    User([Client Browser]) -->|HTTP / HTTPS| ReactApp[React.js SPA Frontend]
    ReactApp -->|REST API JSON + Session Cookie| DjangoAPI[Django REST Framework API]
    
    subgraph Django Backend
        DjangoAPI --> AuthMiddleware[Authentication & CSRF Middleware]
        AuthMiddleware --> ViewLayer[API Views & ViewSets]
        ViewLayer --> SerializerLayer[Serializers & Validation]
        SerializerLayer --> ModelLayer[Django ORM Models]
    end
    
    ModelLayer --> Database[(SQLite / PostgreSQL DB)]
    ModelLayer --> MediaStore[Media Storage / File System]
```

## End-to-End Data Flow

1. **Client Interaction**: The user performs an action in the React UI (e.g., publishing an article or adding a comment).
2. **API Dispatch**: The centralized React API client (`src/api/client.js`) attaches the `X-CSRFToken` header and sends credentials (`withCredentials: true`).
3. **Django Authentication**: Django's `SessionAuthentication` and `CsrfViewMiddleware` validate the request cookies.
4. **Validation & Business Logic**: Serializers validate input schemas and model constraints.
5. **Database Execution**: Django ORM performs optimized database queries (with `select_related` and `prefetch_related`).
6. **JSON Serialization**: Structured JSON data returns to the React application, which updates its local client state.

## Authentication & Request Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant React as React SPA (Vite)
    participant Django as Django Backend (/api/)
    participant DB as SQLite Database

    User->>React: Submit Login Form (username, password)
    React->>Django: POST /api/auth/login/
    Django->>DB: Query User & Verify Password Hash
    DB-->>Django: Valid User Record
    Django-->>React: Set-Cookie (sessionid, csrftoken) + JSON User Profile
    React->>React: Update AuthContext (user state)
    
    User->>React: Navigate to Admin Dashboard
    React->>Django: GET /api/admin/dashboard/ (Cookie sent)
    Django->>Django: Check user.is_staff Permission
    Django->>DB: Fetch Aggregated Metrics & Calendar Query
    DB-->>Django: Query Results
    Django-->>React: Return JSON (metrics, charts, calendar)
    React->>User: Render Dashboard & Analytics
```

## Key Architectural Principles

1. **Zero Secret Leakage**: No secret keys, database credentials, or email passwords exist in the React bundle.
2. **Authoritative Permissions**: Every administrative API endpoint requires `is_staff=True` enforced by Django's `IsAdminUser` permission class.
3. **Predictable API Responses**: All responses follow clean, standardized JSON schemas with HTTP status codes.
"""
    },
    {
        'slug': 'rest-api-reference',
        'title': 'REST API Reference',
        'category': 'API & Protocols',
        'description': 'Comprehensive documentation of endpoints, payload structures, authentication headers, and error conventions.',
        'updated_at': '2026-09-02',
        'read_time': '8 min read',
        'toc': [
            {'id': 'api-standards', 'title': 'API Standards & Error Codes'},
            {'id': 'auth-endpoints', 'title': 'Authentication Endpoints'},
            {'id': 'blog-endpoints', 'title': 'Public Blog Endpoints'},
            {'id': 'admin-endpoints', 'title': 'Admin Control Panel Endpoints'},
        ],
        'content': """# REST API Reference

The backend exposes a clean, resource-oriented REST API under `/api/` built on Django REST Framework.

## API Standards & Error Codes

All endpoints adhere to REST conventions with standard HTTP status codes:
- `200 OK`: Successful retrieval or synchronous update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Payload validation error.
- `401 Unauthorized`: Authentication required.
- `403 Forbidden`: Insufficient permissions (e.g. non-staff user accessing admin API).
- `404 Not Found`: Requested resource does not exist.
- `429 Too Many Requests`: Rate limit reached (e.g. OTP resend cooldown or max attempts).

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["An account with this email address already exists."]
  }
}
```

## Authentication Endpoints

### 1. Register User & Trigger OTP
`POST /api/auth/signup/`

**Request Body:**
```json
{
  "username": "developer_alex",
  "email": "alex@example.com",
  "first_name": "Alex",
  "last_name": "Dev",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Verification code sent to alex@example.com.",
  "email": "alex@example.com"
}
```

### 2. Verify OTP & Activate Account
`POST /api/auth/verify-otp/`

**Request Body:**
```json
{
  "otp": "492817"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account verified successfully!",
  "user": {
    "id": 4,
    "username": "developer_alex",
    "email": "alex@example.com",
    "full_name": "Alex Dev",
    "is_staff": false,
    "is_superuser": false,
    "avatar_url": "https://ui-avatars.com/api/?name=Alex+Dev&background=1e293b&color=22d3ee",
    "activity_stats": {
      "comments_written": 0,
      "posts_appreciated": 0,
      "posts_published": 0
    }
  }
}
```

## Public Blog Endpoints

### 1. Get Homepage Aggregate
`GET /api/blog/home/`

**Response (200 OK):**
```json
{
  "success": true,
  "hero_posts": [ ... ],
  "trending_main": { ... },
  "trending_sidebar": [ ... ],
  "latest_posts": [ ... ],
  "ai_suggestions": [ ... ],
  "archive_post": { ... }
}
```

### 2. Toggle Post Appreciation
`POST /api/blog/posts/<slug>/appreciate/` *(Auth Required)*

**Response (200 OK):**
```json
{
  "success": true,
  "appreciated": true,
  "total_appreciations": 14
}
```

## Admin Control Panel Endpoints

### 1. Get Admin Dashboard Summary
`GET /api/admin/dashboard/` *(Staff Required)*

**Response (200 OK):**
```json
{
  "success": true,
  "metrics": {
    "published_count": 12,
    "scheduled_count": 3,
    "draft_count": 5,
    "planned_count": 8
  },
  "chart_data": {
    "labels": ["Post A", "Post B", "Post C"],
    "datasets": [ ... ]
  },
  "calendar": {
    "month_name": "September",
    "year": 2026,
    "weeks": [ ... ]
  }
}
```
"""
    },
    {
        'slug': 'database-schema',
        'title': 'Database Schema & Entity Models',
        'category': 'Data & Models',
        'description': 'Relational data models, indexing strategies, field definitions, and entity relationship diagrams.',
        'updated_at': '2026-09-02',
        'read_time': '6 min read',
        'toc': [
            {'id': 'er-diagram', 'title': 'Entity Relationship Diagram'},
            {'id': 'model-definitions', 'title': 'Core Model Definitions'},
            {'id': 'indexing-optimization', 'title': 'Query Indexing & Performance'},
        ],
        'content': """# Database Schema & Entity Models

The application data architecture is built on Django's ORM, providing relational integrity, database-level unique constraints, and optimized index lookups.

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Post : "authors"
    User ||--o{ Comment : "writes"
    User }o--o{ Post : "appreciates"
    Post ||--o{ Comment : "contains"
    Post }o--o{ Tag : "tagged_with"
    NewsletterSubscriber {
        int id PK
        string email UK
        datetime subscribed_at
    }

    User {
        int id PK
        string username UK
        string email UK
        string password
        string first_name
        string last_name
        boolean is_staff
        boolean is_active
        datetime date_joined
    }

    Post {
        int id PK
        string title
        string subtitle
        string slug UK_date
        text content
        string thumbnail
        string meta_description
        string status
        boolean is_active
        boolean is_recommended
        datetime publish_date
        datetime created_at
        datetime updated_at
        int author_id FK
    }

    Tag {
        int id PK
        string name UK
    }

    Comment {
        int id PK
        int post_id FK
        int author_id FK
        text body
        boolean is_pinned
        datetime created_at
    }
```

## Core Model Definitions

### 1. `Post` Model
- `status`: Choices `['PL' (Planned), 'DF' (Draft), 'SC' (Scheduled), 'PB' (Published)]`.
- `slug`: Unique per publication date with automatic conflict resolution.
- `appreciations`: Many-to-Many relation with `User`.
- `tags`: Many-to-Many relation with `Tag`.

### 2. `Comment` Model
- `is_pinned`: Boolean flag to spotlight author remarks or top contributions.
- `created_at`: Indexed for chronologically ordered threaded retrieval.

## Query Indexing & Performance
- `Post` table includes a composite index on `['-publish_date']` for rapid timeline filtering.
- Multi-join aggregations use `Count('appreciations', distinct=True) + Count('comments', distinct=True)` to prevent SQL Cartesian product inflation.
"""
    },
    {
        'slug': 'authentication-security',
        'title': 'Authentication & Security Hardening',
        'category': 'Security',
        'description': 'Detailed breakdown of the session-based authentication flow, OTP verification, rate limiting, and CSRF protection.',
        'updated_at': '2026-09-02',
        'read_time': '6 min read',
        'toc': [
            {'id': 'otp-workflow', 'title': 'OTP Verification Workflow'},
            {'id': 'security-safeguards', 'title': 'Security Safeguards Matrix'},
            {'id': 'csrf-session', 'title': 'CSRF & Cookie Protection'},
        ],
        'content': """# Authentication & Security Hardening

The application implements a secure, defense-in-depth authentication system designed for same-origin single-page applications.

## OTP Verification Workflow

```mermaid
stateDiagram-v2
    [*] --> FormSubmitted: User submits signup form
    FormSubmitted --> InactiveUserCreated: Validation passed
    InactiveUserCreated --> SessionOTPGenderated: Generate 6-digit random code
    SessionOTPGenderated --> EmailDispatched: Send HTML verification email
    EmailDispatched --> WaitingForInput: Redirect to /verify-otp/

    state WaitingForInput {
        [*] --> CheckCode
        CheckCode --> Valid: Code matches & within 10 min
        CheckCode --> Invalid: Code mismatch (< 5 attempts)
        CheckCode --> ExpiredOrMaxed: > 5 attempts or > 10 min
    }

    Invalid --> WaitingForInput: Decrement remaining attempts
    ExpiredOrMaxed --> [*]: Flush OTP session & require signup
    Valid --> UserActivated: Set is_active = True
    UserActivated --> SessionEstablished: login(request, user)
    SessionEstablished --> [*]: Redirect to App Home
```

## Security Safeguards Matrix

| Security Layer | Implementation Mechanism | Threat Mitigated |
| :--- | :--- | :--- |
| **Authentication** | Django Session Auth + SameSite Cookies | Token theft via localStorage XSS |
| **CSRF Defense** | `CsrfViewMiddleware` + `X-CSRFToken` Header | Cross-Site Request Forgery |
| **Brute Force Defense** | 5-attempt rate limit + 60s resend cooldown | OTP enumeration and SMS/Email flooding |
| **Authorization** | `IsAdminUser` (`is_staff=True`) on admin API | Unauthorized administrative access |
| **Content Security** | HTML Sanitization with DOMPurify | Stored XSS via user comments or markdown |
| **SQL Injection** | Parameterized Django ORM queries | Database manipulation attacks |
| **Media Safety** | Server-side MIME & Pillow image verification | Malicious file execution |

## CSRF & Cookie Protection
When the React application boots, it calls `GET /api/auth/csrf/` to seed the `csrftoken` cookie. Every subsequent mutation (`POST`, `PATCH`, `DELETE`) reads the cookie value and sends it in the `X-CSRFToken` header.
"""
    },
    {
        'slug': 'component-design-system',
        'title': 'Component Design System & Tokens',
        'category': 'Design System',
        'description': 'Design tokens, color palettes, responsive data tables, code highlighting, and 320px mobile rules.',
        'updated_at': '2026-09-02',
        'read_time': '5 min read',
        'toc': [
            {'id': 'color-tokens', 'title': 'Color Tokens & Palette'},
            {'id': 'responsive-rules', 'title': '320px Mobile Responsiveness'},
            {'id': 'component-inventory', 'title': 'Component Inventory'},
        ],
        'content': """# Component Design System & Tokens

The platform UI is built on a restrained, developer-focused design system inspired by leading technical portals (Stripe Docs, GitHub Docs, Linear).

:::tip
**Design Philosophy**: Restrained color palette, information density, semantic hierarchy, accessible keyboard navigation, and guaranteed responsiveness down to 320px viewports.
:::

## Color Tokens & Palette

- **Background (Dark)**: `#0f172a` (Slate-900)
- **Card / Surface**: `#1e293b` (Slate-800)
- **Elevated Surface / Popover**: `#334155` (Slate-700)
- **Borders**: `#334155` / `rgba(51, 65, 85, 0.7)`
- **Primary Accent**: Cyan-400 (`#22d3ee`) & Teal-500 (`#14b8a6`)
- **Text Title**: `#f8fafc` (Slate-50)
- **Text Paragraph**: `#cbd5e1` (Slate-300)
- **Text Muted**: `#94a3b8` (Slate-400)

## 320px Mobile Responsiveness Rules

1. **Tables**: Wrapped in `<div className="overflow-x-auto">` with non-shrinking min-width columns.
2. **Code Blocks**: Formatted with `<pre className="overflow-x-auto">` with language label and copy button.
3. **Diagrams**: Mermaid SVGs render with horizontal overflow handling.
4. **Navigation**: Desktop persistent sidebar transitions into an accessible off-canvas drawer on small screens.
5. **Forms**: Single-column stacking with full-width touch targets.

## Component Inventory

- `DataTable`: Responsive sorting, status badges, pagination, empty states.
- `CodeBlock`: Syntax highlighting, language identifier, copy-to-clipboard feedback.
- `MermaidDiagram`: Flowcharts, ER diagrams, sequence blueprints.
- `Callout`: Note, Tip, Warning, Danger, and Success callout blocks.
- `Breadcrumbs`: Path navigation for documentation guides.
- `TableOfContents`: Sticky right-side heading tracker.
"""
    }
]


class DocsListAPIView(APIView):
    """Returns documentation topics catalog."""
    permission_classes = [AllowAny]

    def get(self, request):
        docs = [{
            'slug': d['slug'],
            'title': d['title'],
            'category': d['category'],
            'description': d['description'],
            'updated_at': d['updated_at'],
            'read_time': d['read_time'],
        } for d in DOCS_CATALOG]

        return Response({
            'success': True,
            'docs': docs
        })


class DocDetailAPIView(APIView):
    """Returns full technical doc topic with structured content, TOC, and diagrams."""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        doc = next((d for d in DOCS_CATALOG if d['slug'] == slug), None)
        if not doc:
            return Response({'success': False, 'message': 'Documentation topic not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'doc': doc
        })

