# --- FILE: blog_app/models.py ---

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify

class Tag(models.Model):
    """Model for blog post tags."""
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    """Model for a single blog post."""
    class Status(models.TextChoices):
        PLANNED = 'PL', 'Planned'
        DRAFT = 'DF', 'Draft'
        SCHEDULED = 'SC', 'Scheduled'
        PUBLISHED = 'PB', 'Published'

    title = models.CharField(max_length=250)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    slug = models.SlugField(max_length=250, unique_for_date='publish_date', blank=True)
    content = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='blog_thumbnails/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    meta_description = models.TextField(max_length=160, blank=True, null=True)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.PLANNED)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    is_active = models.BooleanField(default=True)
    is_recommended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    publish_date = models.DateTimeField(default=timezone.now)
    appreciations = models.ManyToManyField(User, related_name='appreciated_posts', blank=True)

    class Meta:
        ordering = ['-publish_date']
        indexes = [ models.Index(fields=['-publish_date']), ]

    def __str__(self):
        return self.title

    @property
    def total_appreciations(self):
        return self.appreciations.count()
    
    def save(self, *args, **kwargs):
        """Automatically generate a slug from the title if one doesn't exist."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Comment(models.Model):
    """Model for comments on a blog post."""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_pinned', '-created_at']
        indexes = [ models.Index(fields=['-created_at']), ]

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post}'

class NewsletterSubscriber(models.Model):
    """Model for users who subscribe to the newsletter."""
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email