# --- FILE: blog_app/api/serializers.py ---

from rest_framework import serializers
from django.db.models import Count
from articles.models import Post, Tag, Comment, NewsletterSubscriber



class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'posts_count']

    def get_posts_count(self, obj):
        return obj.posts.filter(is_active=True, status=Post.Status.PUBLISHED).count()


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author_username', 'author_name', 'author_avatar',
            'body', 'created_at', 'formatted_date', 'is_pinned'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_author_avatar(self, obj):
        name = obj.author.get_full_name() or obj.author.username
        return f"https://ui-avatars.com/api/?name={name}&background=1e293b&color=22d3ee"

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y')


class PostListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    total_appreciations = serializers.IntegerField(read_only=True)
    comments_count = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'subtitle', 'slug', 'thumbnail_url',
            'tags', 'author_name', 'publish_date', 'formatted_date',
            'total_appreciations', 'comments_count', 'is_recommended',
            'meta_description'
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

    def get_formatted_date(self, obj):
        return obj.publish_date.strftime('%b %d, %Y') if obj.publish_date else ''


class PostDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    author_bio = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    related_posts = serializers.SerializerMethodField()
    total_appreciations = serializers.IntegerField(read_only=True)
    user_has_appreciated = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'subtitle', 'slug', 'content', 'thumbnail_url',
            'tags', 'author_name', 'author_bio', 'publish_date', 'formatted_date',
            'meta_description', 'total_appreciations', 'user_has_appreciated',
            'comments', 'related_posts', 'is_recommended'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def get_author_bio(self, obj):
        return "Developer, Founder, and writer on a mission to build and share."

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def get_formatted_date(self, obj):
        return obj.publish_date.strftime('%b %d, %Y') if obj.publish_date else ''

    def get_user_has_appreciated(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.appreciations.filter(id=request.user.id).exists()
        return False

    def get_comments(self, obj):
        comments_qs = obj.comments.select_related('author').order_by('-is_pinned', '-created_at')
        return CommentSerializer(comments_qs, many=True).data

    def get_related_posts(self, obj):
        tag_ids = obj.tags.values_list('id', flat=True)
        related = Post.objects.filter(
            tags__in=tag_ids, is_active=True, status=Post.Status.PUBLISHED
        ).exclude(id=obj.id).distinct().annotate(same_tags=Count('tags')).order_by('-same_tags', '-publish_date')[:3]
        return PostListSerializer(related, many=True, context=self.context).data


class AddCommentSerializer(serializers.Serializer):
    body = serializers.CharField(min_length=2, max_length=5000)


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email']
