# --- FILE: accounts/api/views.py ---

import random
import logging
from datetime import timedelta
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.views import send_otp_email, MAX_OTP_ATTEMPTS
from .serializers import (
    UserSerializer,
    SignupSerializer,
    LoginSerializer,
    OtpVerifySerializer,
    EditProfileSerializer,
)

logger = logging.getLogger(__name__)


class CsrfTokenAPIView(APIView):
    """Returns the CSRF token to initialize client SPA sessions."""
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})


class SignupAPIView(APIView):
    """Handles new user registration and triggers email OTP."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            password=data['password'],
            is_active=False
        )

        otp = random.randint(100000, 999999)
        request.session['otp_code'] = str(otp)
        request.session['verification_user_id'] = user.id
        request.session['otp_attempts'] = 0
        request.session['otp_expiry'] = (timezone.now() + timedelta(minutes=10)).isoformat()
        request.session['resend_cooldown_expiry'] = (timezone.now() + timedelta(seconds=60)).isoformat()
        request.session.save()

        try:
            send_otp_email(request, user, otp)
            return Response({
                'success': True,
                'message': f'Verification code sent to {user.email}.',
                'email': user.email,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to send OTP email: {e}", exc_info=True)
            user.delete()
            return Response({
                'success': False,
                'message': 'Failed to send verification email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOtpAPIView(APIView):
    """Verifies OTP, activates account, logs in user, and returns user data."""
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.session.get('verification_user_id')
        otp_code = request.session.get('otp_code')
        otp_expiry_str = request.session.get('otp_expiry')

        if not user_id or not otp_code:
            return Response({
                'success': False,
                'message': 'Verification session expired. Please sign up again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = OtpVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        submitted_otp = serializer.validated_data['otp'].strip()
        attempts = request.session.get('otp_attempts', 0) + 1
        request.session['otp_attempts'] = attempts

        if attempts > MAX_OTP_ATTEMPTS:
            request.session.pop('otp_code', None)
            request.session.pop('verification_user_id', None)
            return Response({
                'success': False,
                'message': 'Too many incorrect attempts. Please sign up or request a new code.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        if otp_expiry_str:
            expiry_time = timezone.datetime.fromisoformat(otp_expiry_str)
            if timezone.now() > expiry_time:
                return Response({
                    'success': False,
                    'message': 'Verification code has expired. Please request a new code.'
                }, status=status.HTTP_400_BAD_REQUEST)

        if submitted_otp == str(otp_code):
            try:
                user = User.objects.get(id=user_id)
                user.is_active = True
                user.save()

                for key in ['otp_code', 'verification_user_id', 'otp_expiry', 'resend_cooldown_expiry', 'otp_attempts']:
                    request.session.pop(key, None)

                login(request, user)
                return Response({
                    'success': True,
                    'message': 'Account verified successfully!',
                    'user': UserSerializer(user).data
                })
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found. Please sign up again.'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            remaining = MAX_OTP_ATTEMPTS - attempts
            return Response({
                'success': False,
                'message': f'Invalid code. {max(0, remaining)} attempt(s) remaining.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendOtpAPIView(APIView):
    """Resends a fresh OTP code respecting the cooldown timer."""
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.session.get('verification_user_id')
        resend_cooldown_expiry_str = request.session.get('resend_cooldown_expiry')

        if not user_id:
            return Response({
                'success': False,
                'message': 'No pending verification found. Please sign up.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if resend_cooldown_expiry_str:
            expiry_time = timezone.datetime.fromisoformat(resend_cooldown_expiry_str)
            if timezone.now() < expiry_time:
                seconds_left = int((expiry_time - timezone.now()).total_seconds())
                return Response({
                    'success': False,
                    'message': f'Please wait {seconds_left} seconds before requesting a new code.',
                    'seconds_left': seconds_left
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        try:
            user = User.objects.get(id=user_id)
            otp = random.randint(100000, 999999)

            request.session['otp_code'] = str(otp)
            request.session['otp_attempts'] = 0
            request.session['otp_expiry'] = (timezone.now() + timedelta(minutes=10)).isoformat()
            request.session['resend_cooldown_expiry'] = (timezone.now() + timedelta(seconds=60)).isoformat()
            request.session.save()

            send_otp_email(request, user, otp)
            return Response({
                'success': True,
                'message': 'A new verification code has been sent to your email.'
            })
        except Exception as e:
            logger.error(f"Resend OTP error: {e}", exc_info=True)
            return Response({
                'success': False,
                'message': 'Failed to send new code. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginAPIView(APIView):
    """Authenticates user credentials and starts an authenticated session."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response({
                    'success': False,
                    'message': 'This account is pending verification or inactive.'
                }, status=status.HTTP_403_FORBIDDEN)

            login(request, user)
            return Response({
                'success': True,
                'message': f'Welcome back, {user.get_full_name() or user.username}!',
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid username or password.'
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutAPIView(APIView):
    """Terminates user session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'success': True, 'message': 'Logged out successfully.'})


class CurrentUserAPIView(APIView):
    """Returns or updates the current authenticated user profile."""
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'success': True,
                'authenticated': True,
                'user': UserSerializer(request.user).data
            })
        return Response({
            'success': True,
            'authenticated': False,
            'user': None
        })

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication required.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        serializer = EditProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully!',
                'user': UserSerializer(user).data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

