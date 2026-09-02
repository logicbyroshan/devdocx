# 🏛️ DevDocs Project Structure

This document outlines the organization and responsibilities of modules across the **DevDocs** codebase.

---

## Directory Overview

```text
DEVDOCS/
├── accounts/                   # Django Application: Authentication, OTP & Profiles
│   ├── api/                    # DRF Serializers, Views, and URL routing for Auth
│   │   ├── serializers.py      # Serializers for Signup, Login, OTP, User, Edit Profile
│   │   ├── views.py            # APIViews for Csrf, Signup, VerifyOtp, ResendOtp, Login, Logout, Me
│   │   └── urls.py             # Registered under /api/auth/
│   ├── templates/emails/       # Transactional HTML email templates (otp_email.html)
│   ├── models.py               # Custom User model hooks
│   └── tests.py                # Unit test suite for Auth & Session management
│
├── blog_app/                   # Django Application: Public Content & Documentation Engine
│   ├── api/                    # DRF Serializers, Views, and URL routing for Content & Docs
│   │   ├── serializers.py      # Serializers for Posts, Comments, Tags, Subscribers
│   │   ├── views.py            # APIViews for Home, Posts, Appreciate, Comments, Docs
│   │   └── urls.py             # Registered under /api/blog/
│   ├── models.py               # Post, Tag, Comment, NewsletterSubscriber
│   └── tests.py                # Unit test suite for public content
│
├── admin_app/                  # Django Application: Staff Editorial Control Center
│   ├── api/                    # DRF Serializers, Views, and URL routing for Admin
│   │   ├── serializers.py      # Serializers for Admin Posts, Comments, Activity
│   │   ├── views.py            # APIViews for Dashboard, Post CRUD, Calendar, Moderation
│   │   └── urls.py             # Registered under /api/admin/
│   └── tests.py                # Unit test suite for Staff permissions and admin workflows
│
├── config/                     # Django Project Configuration Root
│   ├── settings.py             # DRF, CORS, Auth, Static/Media, Database configuration
│   ├── urls.py                 # Root URL router & SPA catch-all fallback
│   ├── views.py                # SPAView serving compiled frontend dist/index.html
│   └── wsgi.py                 # WSGI application entrypoint
│
├── frontend/                   # React.js + Tailwind CSS Single Page Application
│   ├── src/
│   │   ├── api/                # API client adapters (client.js, auth.js, blog.js, admin.js, docs.js)
│   │   ├── contexts/           # React context providers (AuthContext, ThemeContext, ToastContext)
│   │   ├── components/
│   │   │   ├── ui/             # Core UI components (Button, Input, Badge, Callout, Modal, Skeleton)
│   │   │   ├── tables/         # DataTable with 320px safe horizontal scrolling
│   │   │   ├── code/           # CodeBlock with Prism syntax highlighting & copy button
│   │   │   ├── diagrams/       # MermaidDiagram dynamic renderer
│   │   │   ├── content/        # MarkdownContent engine (Markdown + Mermaid + Callouts)
│   │   │   ├── charts/         # PerformanceChart responsive SVG bar chart
│   │   │   └── navigation/     # Navbar, Sidebar, TableOfContents
│   │   ├── layouts/            # MainLayout, AdminLayout, AuthLayout
│   │   └── pages/              # Home, Articles, Detail, Docs, Admin, Auth
│   ├── index.html              # HTML entrypoint with font imports
│   ├── tailwind.config.js      # Design tokens & semantic color system
│   └── vite.config.js          # Vite build config & proxy to Django at :8000
│
├── FRONTEND_MIGRATION.md       # Architecture audit and migration tracking document
├── build.sh                    # Production deployment script
├── requirements.txt            # Python dependencies
└── manage.py                   # Django CLI executable
```
