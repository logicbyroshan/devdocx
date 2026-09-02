# --- FILE: admin_app/api/urls.py ---

from django.urls import path
from . import views

app_name = 'admin_api'

urlpatterns = [
    path('dashboard/', views.AdminDashboardAPIView.as_view(), name='dashboard'),
    path('posts/', views.AdminPostListCreateAPIView.as_view(), name='posts_list_create'),
    path('posts/<int:post_id>/', views.AdminPostDetailAPIView.as_view(), name='post_detail'),
    path('posts/<int:post_id>/toggle-active/', views.AdminTogglePostActiveAPIView.as_view(), name='toggle_active'),
    path('posts/<int:post_id>/toggle-recommend/', views.AdminTogglePostRecommendAPIView.as_view(), name='toggle_recommend'),
    path('posts/plan/', views.AdminPlanPostAPIView.as_view(), name='plan_post'),
    path('activity/', views.AdminActivityAPIView.as_view(), name='activity'),
    path('comments/<int:comment_id>/toggle-pin/', views.AdminTogglePinCommentAPIView.as_view(), name='toggle_pin_comment'),
    path('comments/<int:comment_id>/', views.AdminDeleteCommentAPIView.as_view(), name='delete_comment'),
]
