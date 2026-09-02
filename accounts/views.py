# --- FILE: accounts/views.py ---

import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

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
    text_content = (
        f"Hello {user.username},\n\n"
        f"Welcome to DevDocs! Your verification code is: {otp}\n\n"
        f"This code expires in 10 minutes."
    )
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@devdocs.io')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)