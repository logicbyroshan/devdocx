# --- FILE: accounts/api/urls.py ---

from django.urls import path
from . import views

app_name = 'accounts_api'

urlpatterns = [
    path('csrf/', views.CsrfTokenAPIView.as_view(), name='csrf'),
    path('signup/', views.SignupAPIView.as_view(), name='signup'),
    path('verify-otp/', views.VerifyOtpAPIView.as_view(), name='verify_otp'),
    path('resend-otp/', views.ResendOtpAPIView.as_view(), name='resend_otp'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('logout/', views.LogoutAPIView.as_view(), name='logout'),
    path('me/', views.CurrentUserAPIView.as_view(), name='current_user'),
]
