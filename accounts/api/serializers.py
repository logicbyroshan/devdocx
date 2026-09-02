# --- FILE: accounts/api/serializers.py ---

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from blog_app.models import Post, Comment


class UserSerializer(serializers.ModelSerializer):
    activity_stats = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_superuser', 'date_joined',
            'avatar_url', 'activity_stats'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'date_joined']

    def get_full_name(self, obj):
        name = obj.get_full_name()
        return name if name.strip() else obj.username

    def get_avatar_url(self, obj):
        name = obj.get_full_name() or obj.username
        return f"https://ui-avatars.com/api/?name={name}&background=1e293b&color=22d3ee"

    def get_activity_stats(self, obj):
        return {
            'comments_written': Comment.objects.filter(author=obj).count(),
            'posts_appreciated': obj.appreciated_posts.count(),
            'posts_published': Post.objects.filter(author=obj, status=Post.Status.PUBLISHED).count(),
        }


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(data['password'])
        return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class OtpVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=10)


class EditProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value
