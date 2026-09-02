# --- FILE: blog_app/api/urls.py ---

from django.urls import path
from . import views

app_name = 'blog_api'

urlpatterns = [
    path('home/', views.BlogHomeAPIView.as_view(), name='home'),
    path('posts/', views.PostListAPIView.as_view(), name='posts_list'),
    path('posts/<slug:slug>/', views.PostDetailAPIView.as_view(), name='post_detail'),
    path('posts/<slug:slug>/appreciate/', views.ToggleAppreciationAPIView.as_view(), name='toggle_appreciation'),
    path('posts/<slug:slug>/comments/', views.AddCommentAPIView.as_view(), name='add_comment'),
    path('categories/', views.CategoryListAPIView.as_view(), name='categories'),
    path('subscribe/', views.NewsletterSubscribeAPIView.as_view(), name='subscribe'),
    path('about/', views.AboutAuthorAPIView.as_view(), name='about'),
    path('docs/', views.DocsListAPIView.as_view(), name='docs_list'),
    path('docs/<slug:slug>/', views.DocDetailAPIView.as_view(), name='doc_detail'),
]

