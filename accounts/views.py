# --- FILE: accounts/views.py ---

import random
import logging
from datetime import timedelta
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from django.contrib import messages
from .forms import CustomUserCreationForm, EditProfileForm
from blog_app.models import Post, Comment

logger = logging.getLogger(__name__)

MAX_OTP_ATTEMPTS = 5


def send_otp_email(request, user, otp):
    """Helper function to send a styled HTML OTP email with plain text fallback."""
    subject = "Your Verification Code for DevDocs"
    context = {
        'user': user,
        'otp': otp,
        'subject': subject,
        'introductory_text': "Welcome to DevDocs! Please use the following code to verify your account:",
    }
    
    html_content = render_to_string('accounts/otp_email.html', context)
    text_content = f"Hello {user.username},\n\nWelcome to DevDocs! Your verification code is: {otp}\n\nThis code expires in 10 minutes."
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@devdocs.io')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)



def signup_view(request):
    """
    Handles user registration and initiates email OTP verification.
    """
    if request.user.is_authenticated:
        return redirect('blog_app:home')

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            # Generate and store OTP in user session
            otp = random.randint(100000, 999999)
            request.session['otp_code'] = str(otp)
            request.session['verification_user_id'] = user.id
            request.session['otp_attempts'] = 0
            request.session['otp_expiry'] = (timezone.now() + timedelta(minutes=10)).isoformat()
            request.session['resend_cooldown_expiry'] = (timezone.now() + timedelta(seconds=60)).isoformat()
            request.session.save()

            try:
                send_otp_email(request, user, otp)
                messages.info(request, f'A verification code has been sent to {user.email}. Please check your inbox.')
                return redirect('accounts:otp_verification')

            except Exception as e:
                logger.error(f"Failed to send OTP email for {user.username}. Error: {e}", exc_info=True)
                messages.error(request, 'We could not send a verification email. Please try again later.')
                user.delete()
                return redirect('accounts:signup')
        else:
            messages.error(request, 'Please correct the errors shown below.')
    else:
        form = CustomUserCreationForm()

    return render(request, 'accounts/signup.html', {'form': form})


def otp_verification_view(request):
    """Verifies the OTP submitted by the user and activates the account."""
    if request.user.is_authenticated:
        return redirect('blog_app:home')

    user_id = request.session.get('verification_user_id')
    otp_code = request.session.get('otp_code')
    otp_expiry_str = request.session.get('otp_expiry')

    if not user_id or not otp_code:
        messages.error(request, 'Your verification session has expired or is invalid. Please sign up again.')
        return redirect('accounts:signup')

    if request.method == 'POST':
        submitted_otp = request.POST.get('otp', '').strip()
        attempts = request.session.get('otp_attempts', 0) + 1
        request.session['otp_attempts'] = attempts

        # Check maximum attempts rate limit
        if attempts > MAX_OTP_ATTEMPTS:
            request.session.pop('otp_code', None)
            request.session.pop('verification_user_id', None)
            messages.error(request, 'Too many incorrect attempts. Please sign up or request a new code.')
            return redirect('accounts:signup')

        # Check OTP expiration
        if otp_expiry_str:
            expiry_time = timezone.datetime.fromisoformat(otp_expiry_str)
            if timezone.now() > expiry_time:
                messages.error(request, 'Your verification code has expired. Please request a new code.')
                return render(request, 'accounts/otp_verification.html', {'can_resend': True, 'time_left': 0})

        if submitted_otp == str(otp_code):
            try:
                user = User.objects.get(id=user_id)
                user.is_active = True
                user.save()

                # Clean up verification keys from session
                for key in ['otp_code', 'verification_user_id', 'otp_expiry', 'resend_cooldown_expiry', 'otp_attempts']:
                    request.session.pop(key, None)

                # Authenticate user and keep session active
                login(request, user)
                messages.success(request, 'Your account has been verified successfully!')
                return redirect('blog_app:home')
            except User.DoesNotExist:
                messages.error(request, 'User not found. Please sign up again.')
                return redirect('accounts:signup')
        else:
            remaining = MAX_OTP_ATTEMPTS - attempts
            if remaining > 0:
                messages.error(request, f'Invalid OTP. You have {remaining} attempt(s) remaining.')
            else:
                messages.error(request, 'Invalid OTP. No attempts remaining. Please request a new code.')

    # Logic for the resend timer
    resend_cooldown_expiry_str = request.session.get('resend_cooldown_expiry')
    can_resend, time_left = True, 0
    if resend_cooldown_expiry_str:
        expiry_time = timezone.datetime.fromisoformat(resend_cooldown_expiry_str)
        if timezone.now() < expiry_time:
            can_resend = False
            time_left = max(0, int((expiry_time - timezone.now()).total_seconds()))

    return render(request, 'accounts/otp_verification.html', {'can_resend': can_resend, 'time_left': time_left})


def resend_otp_view(request):
    """Generates and resends a new OTP if the cooldown period has passed."""
    user_id = request.session.get('verification_user_id')
    resend_cooldown_expiry_str = request.session.get('resend_cooldown_expiry')

    if not user_id:
        return redirect('accounts:signup')

    if resend_cooldown_expiry_str and timezone.now() < timezone.datetime.fromisoformat(resend_cooldown_expiry_str):
        messages.warning(request, 'Please wait before requesting another code.')
        return redirect('accounts:otp_verification')

    try:
        user = User.objects.get(id=user_id)
        otp = random.randint(100000, 999999)

        # Update session with new OTP and reset cooldown & attempts
        request.session['otp_code'] = str(otp)
        request.session['otp_attempts'] = 0
        request.session['otp_expiry'] = (timezone.now() + timedelta(minutes=10)).isoformat()
        request.session['resend_cooldown_expiry'] = (timezone.now() + timedelta(seconds=60)).isoformat()
        request.session.save()

        send_otp_email(request, user, otp)
        messages.success(request, 'A new verification code has been sent to your email.')
    except Exception as e:
        logger.error(f"Failed to RESEND OTP for user ID {user_id}. Error: {e}", exc_info=True)
        messages.error(request, 'Failed to send a new code. Please try again later.')

    return redirect('accounts:otp_verification')


@login_required
def profile_view(request):
    """
    Displays the profile of the currently logged-in user with their activity stats.
    """
    user = request.user

    comments_written_count = Comment.objects.filter(author=user).count()
    posts_appreciated_count = user.appreciated_posts.count()
    posts_published_count = Post.objects.filter(author=user, status=Post.Status.PUBLISHED).count()

    context = {
        'user': user,
        'comments_written_count': comments_written_count,
        'posts_appreciated_count': posts_appreciated_count,
        'posts_published_count': posts_published_count,
    }
    return render(request, 'accounts/profile.html', context)


@login_required
def edit_profile_view(request):
    """
    Handles updating the user's profile information.
    """
    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated successfully!')
            return redirect('accounts:profile')
    else:
        form = EditProfileForm(instance=request.user)

    return render(request, 'accounts/edit_profile.html', {'form': form})