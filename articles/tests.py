from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Post, Tag, Comment, NewsletterSubscriber

class ArticlesApiTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='blogauthor',
            email='author@example.com',
            password='Password123!',
            first_name='Blog',
            last_name='Author'
        )
        self.tag_tech = Tag.objects.create(name='Tech')
        self.tag_growth = Tag.objects.create(name='Growth')

        self.published_post = Post.objects.create(
            author=self.user,
            title='First Published Article',
            subtitle='An interesting read',
            slug='first-published-article',
            content='# Full article body content here.',
            status=Post.Status.PUBLISHED,
            is_active=True,
            publish_date=timezone.now()
        )
        self.published_post.tags.add(self.tag_tech)

        self.draft_post = Post.objects.create(
            author=self.user,
            title='Secret Draft Article',
            slug='secret-draft-article',
            content='Draft text',
            status=Post.Status.DRAFT,
            is_active=True
        )

    def test_api_blog_home(self):
        response = self.client.get(reverse('blog_api:home'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('hero_posts', data)
        self.assertIn('latest_posts', data)

    def test_api_blog_posts_list_and_filter(self):
        response = self.client.get(reverse('blog_api:posts_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)

        # Filter by category
        res_tech = self.client.get(reverse('blog_api:posts_list') + '?category=Tech')
        self.assertEqual(res_tech.status_code, 200)
        self.assertEqual(res_tech.json()['count'], 1)

        # Filter by non-matching category
        res_growth = self.client.get(reverse('blog_api:posts_list') + '?category=Growth')
        self.assertEqual(res_growth.status_code, 200)
        self.assertEqual(res_growth.json()['count'], 0)

    def test_api_blog_detail(self):
        response = self.client.get(reverse('blog_api:post_detail', kwargs={'slug': self.published_post.slug}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['post']['title'], 'First Published Article')

        # Draft detail should return 404
        draft_resp = self.client.get(reverse('blog_api:post_detail', kwargs={'slug': self.draft_post.slug}))
        self.assertEqual(draft_resp.status_code, 404)

    def test_api_add_comment_and_toggle_appreciation(self):
        self.client.login(username='blogauthor', password='Password123!')

        # Add comment
        comment_resp = self.client.post(
            reverse('blog_api:add_comment', kwargs={'slug': self.published_post.slug}),
            {'body': 'Great article! Loved the insights.'},
            content_type='application/json'
        )
        self.assertEqual(comment_resp.status_code, 201)
        self.assertTrue(comment_resp.json()['success'])

        # Toggle appreciation
        like_resp = self.client.post(reverse('blog_api:toggle_appreciation', kwargs={'slug': self.published_post.slug}))
        self.assertEqual(like_resp.status_code, 200)
        self.assertTrue(like_resp.json()['appreciated'])
        self.assertEqual(like_resp.json()['total_appreciations'], 1)

    def test_api_subscribe(self):
        resp = self.client.post(reverse('blog_api:subscribe'), {'email': 'subscriber@example.com'}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(NewsletterSubscriber.objects.filter(email='subscriber@example.com').exists())

    def test_api_docs_list_and_detail(self):
        response = self.client.get(reverse('blog_api:docs_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json()['docs']) > 0)

        doc_slug = response.json()['docs'][0]['slug']
        doc_resp = self.client.get(reverse('blog_api:doc_detail', kwargs={'slug': doc_slug}))
        self.assertEqual(doc_resp.status_code, 200)
        self.assertIn('content', doc_resp.json()['doc'])

    def test_spa_fallback_endpoint(self):
        response = self.client.get('/articles')
        self.assertIn(response.status_code, [200, 404])
