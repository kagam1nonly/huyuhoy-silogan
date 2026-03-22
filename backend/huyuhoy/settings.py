import os
import dj_database_url
from pathlib import Path

# Build paths inside the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', '9!s-WXdO!xfjhcpvq%rF^hhy4IMn(yb918KMeE(SnrR(5t47L^rVGa5728@&HBFj')
DEBUG = os.getenv('DJANGO_DEBUG', 'False').lower() == 'true'

# Allowed Hosts
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
if not DEBUG:
    ALLOWED_HOSTS.append('.onrender.com')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'food',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'huyuhoy.urls'

# --- TEMPLATES (FIXED: Required for Admin Panel) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'huyuhoy.wsgi.application'

# --- DATABASE CONFIGURATION ---
database_url = os.getenv('DATABASE_URL')
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

if database_url:
    # Safely configure the database
    config = dj_database_url.parse(database_url, conn_max_age=600, ssl_require=not DEBUG)
    if config:
        DATABASES['default'] = config

# --- STATIC & MEDIA ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# --- SECURITY & CORS ---
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
CSRF_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS
frontend_urls = os.getenv('FRONTEND_URLS', 'http://localhost:5173').split(',')
CORS_ALLOWED_ORIGINS = [url.strip() for url in frontend_urls]
CSRF_TRUSTED_ORIGINS = [url.strip() for url in frontend_urls]
CORS_ALLOW_CREDENTIALS = True

# --- REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ]
}

AUTH_USER_MODEL = 'food.CustomUser'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'