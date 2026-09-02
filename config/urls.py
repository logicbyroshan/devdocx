# --- FILE: config/urls.py ---

from django.contrib import admin
from django.urls import path, re_path, include
from django.conf.urls.static import static
from django.conf import settings
from .views import SPAView

urlpatterns = [
    # Django Admin (Superuser emergency dashboard)
    path('django-admin/', admin.site.urls),

    # RESTful API Endpoints
    path('api/auth/', include('accounts.api.urls', namespace='accounts_api')),
    path('api/blog/', include('articles.api.urls', namespace='blog_api')),
    path('api/admin/', include('dashboard.api.urls', namespace='admin_api')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.views.static import serve

# Static assets from compiled React SPA
urlpatterns += [
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'frontend' / 'dist' / 'assets'}),
]

# Single-Page Application Catch-All Route (must be last)
urlpatterns += [
    re_path(r'^(?!api/|media/|static/|assets/|django-admin/).*$', SPAView.as_view(), name='spa_app'),
]

