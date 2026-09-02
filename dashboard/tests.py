from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from articles.models import Post, Tag, Comment


class DashboardApiTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='StaffPassword123!',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='RegularPassword123!',
            is_staff=False
        )
        self.post = Post.objects.create(
            author=self.staff_user,
            title='Admin Managed Post',
            slug='admin-managed-post',
            content='Content for admin test.',
            status=Post.Status.PUBLISHED,
            publish_date=timezone.now()
        )

    def test_api_admin_dashboard_requires_staff(self):
        self.client.login(username='regularuser', password='RegularPassword123!')
        response = self.client.get(reverse('admin_api:dashboard'))
        self.assertEqual(response.status_code, 403)

        self.client.login(username='staffuser', password='StaffPassword123!')
        response = self.client.get(reverse('admin_api:dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertIn('metrics', response.json())
        self.assertIn('calendar', response.json())

    def test_api_admin_posts_crud(self):
        self.client.login(username='staffuser', password='StaffPassword123!')

        # Create
        create_resp = self.client.post(reverse('admin_api:posts_list_create'), {
            'title': 'API Created Post',
            'subtitle': 'Subtitle',
            'content': '<p>Body</p>',
            'action': 'publish',
            'tags': 'django, react'
        })
        self.assertEqual(create_resp.status_code, 201)
        post_id = create_resp.json()['post']['id']

        # Read
        get_resp = self.client.get(reverse('admin_api:post_detail', kwargs={'post_id': post_id}))
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()['post']['title'], 'API Created Post')

        # Toggle Active
        toggle_resp = self.client.post(reverse('admin_api:toggle_active', kwargs={'post_id': post_id}))
        self.assertEqual(toggle_resp.status_code, 200)

        # Toggle Recommend
        rec_resp = self.client.post(reverse('admin_api:toggle_recommend', kwargs={'post_id': post_id}))
        self.assertEqual(rec_resp.status_code, 200)

        # Plan Post
        plan_resp = self.client.post(reverse('admin_api:plan_post'), {'title': 'New Planned Idea'})
        self.assertEqual(plan_resp.status_code, 201)
        self.assertTrue(Post.objects.filter(title='New Planned Idea', status=Post.Status.PLANNED).exists())


        # Delete
        del_resp = self.client.delete(reverse('admin_api:post_detail', kwargs={'post_id': post_id}))
        self.assertEqual(del_resp.status_code, 200)
        self.assertFalse(Post.objects.filter(id=post_id).exists())

    def test_api_admin_activity_and_moderation(self):
        self.client.login(username='staffuser', password='StaffPassword123!')
        comment = Comment.objects.create(post=self.post, author=self.regular_user, body='Comment to moderate')

        response = self.client.get(reverse('admin_api:activity'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('stats', response.json())
        self.assertIn('comments', response.json())

        # Toggle pin
        pin_resp = self.client.post(reverse('admin_api:toggle_pin_comment', kwargs={'comment_id': comment.id}))
        self.assertEqual(pin_resp.status_code, 200)
        comment.refresh_from_db()
        self.assertTrue(comment.is_pinned)

        # Delete comment
        del_c_resp = self.client.delete(reverse('admin_api:delete_comment', kwargs={'comment_id': comment.id}))
        self.assertEqual(del_c_resp.status_code, 200)
        self.assertFalse(Comment.objects.filter(id=comment.id).exists())
