# --- FILE: admin_app/api/serializers.py ---

from rest_framework import serializers
from django.contrib.auth.models import User
from blog_app.models import Post, Tag, Comment, NewsletterSubscriber
from blog_app.api.serializers import TagSerializer


class AdminPostListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_name = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    total_appreciations = serializers.IntegerField(read_only=True)
    formatted_publish_date = serializers.SerializerMethodField()
    formatted_created_at = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'subtitle', 'slug', 'status', 'status_display',
            'is_active', 'is_recommended', 'publish_date', 'formatted_publish_date',
            'created_at', 'formatted_created_at', 'updated_at', 'author_username',
            'author_name', 'thumbnail_url', 'tags', 'comments_count', 'total_appreciations'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_formatted_publish_date(self, obj):
        return obj.publish_date.strftime('%b %d, %Y') if obj.publish_date else ''

    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%b %d, %Y') if obj.created_at else ''


class AdminPostDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    tags_string = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'subtitle', 'slug', 'content', 'meta_description',
            'status', 'status_display', 'is_active', 'is_recommended',
            'publish_date', 'author_username', 'thumbnail_url', 'tags_string'
        ]

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def get_tags_string(self, obj):
        return ", ".join(t.name for t in obj.tags.all())


class AdminCommentSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_slug = serializers.CharField(source='post.slug', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'post_title', 'post_slug', 'author_username',
            'author_name', 'author_avatar', 'body', 'created_at',
            'formatted_date', 'is_pinned'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_author_avatar(self, obj):
        name = obj.author.get_full_name() or obj.author.username
        return f"https://ui-avatars.com/api/?name={name}&background=1e293b&color=22d3ee"

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y @ %I:%M %p')


class AdminSubscriberSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'subscribed_at', 'formatted_date']

    def get_formatted_date(self, obj):
        return obj.subscribed_at.strftime('%b %d, %Y')


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    formatted_date_joined = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_active', 'date_joined', 'formatted_date_joined'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_formatted_date_joined(self, obj):
        return obj.date_joined.strftime('%b %d, %Y')
