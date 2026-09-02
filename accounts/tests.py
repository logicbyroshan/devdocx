from datetime import timedelta
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone

class AccountsApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_password = 'TestPassword123!'
        self.user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password=self.user_password,
            first_name='Existing',
            last_name='User',
            is_active=True
        )

    def test_api_csrf_returns_token(self):
        response = self.client.get(reverse('accounts_api:csrf'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('csrfToken', response.json())

    def test_api_signup_and_verify_otp(self):
        response = self.client.post(reverse('accounts_api:signup'), {
            'username': 'apisignupuser',
            'first_name': 'Api',
            'last_name': 'User',
            'email': 'apiuser@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['success'])

        otp = self.client.session['otp_code']
        verify_response = self.client.post(reverse('accounts_api:verify_otp'), {
            'otp': otp
        }, content_type='application/json')
        self.assertEqual(verify_response.status_code, 200)
        self.assertTrue(verify_response.json()['success'])
        self.assertEqual(verify_response.json()['user']['username'], 'apisignupuser')

    def test_api_signup_duplicate_email_rejected(self):
        response = self.client.post(reverse('accounts_api:signup'), {
            'username': 'anotheruser',
            'email': 'EXISTING@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])

    def test_api_login_and_logout(self):
        response = self.client.post(reverse('accounts_api:login'), {
            'username': 'existinguser',
            'password': self.user_password
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(response.json()['user']['username'], 'existinguser')

        # Test current user endpoint
        me_response = self.client.get(reverse('accounts_api:current_user'))
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['user']['email'], 'existing@example.com')

        # Test patch profile
        patch_response = self.client.patch(reverse('accounts_api:current_user'), {
            'first_name': 'UpdatedFirst',
            'last_name': 'UpdatedLast'
        }, content_type='application/json')
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.json()['user']['first_name'], 'UpdatedFirst')

        # Test logout
        logout_response = self.client.post(reverse('accounts_api:logout'))
        self.assertEqual(logout_response.status_code, 200)
        self.assertTrue(logout_response.json()['success'])
