from django.apps import AppConfig

class ArticlesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'articles'
    label = 'blog_app'
    verbose_name = 'Articles & Technical Documentation'
