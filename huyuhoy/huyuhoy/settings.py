import os
import dj_database_url
from pathlib import Path, PurePath

# Load environment variables from .env file (for local development)
from dotenv import load_dotenv
load_dotenv()  # This loads variables from .env file into os.environ

# --- DIRECTORIES ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Static files configuration for development and production
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'food', 'static'),
    os.path.join(BASE_DIR, 'static'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
# -------------------

# --- SECURITY ---
# SECRET_KEY is MANDATORY for production
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-*+w&n7_xkl4g=4xksec1rw^uyqt^36_)$c&^3o(sp_xx6bmxp5')

# DEBUG must read directly from the environment
DEBUG = os.environ.get('DEBUG') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

AUTH_USER_MODEL = 'food.CustomUser'
# -------------------

# Application definition
# ... (INSTALLED_APPS, TEMPLATES, AUTH_PASSWORD_VALIDATORS are unchanged) ...

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'food',
    'crispy_forms',
]

CRISPY_TEMPLATE_PACK = 'bootstrap4'

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',    # Serve static files in production
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'huyuhoy.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
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
# TOGGLE BETWEEN LOCAL AND HOSTED DATABASE:
# Set USE_LOCAL_DB = True to use local SQLite
# Set USE_LOCAL_DB = False to use hosted PostgreSQL database
USE_LOCAL_DB = True  # ⚠️ SWITCH THIS TO TOGGLE DATABASE

if USE_LOCAL_DB:
    # LOCAL SQLite DATABASE (for local development without hosted DB)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
else:
    # HOSTED PostgreSQL DATABASE (requires DATABASE_URL in environment)
    # This works both locally (if DATABASE_URL is set) and on Render
    import ssl
    
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600  # Sets max connection lifetime
        )
    }
    
    # Add SSL settings for PostgreSQL connections (fixes SSL errors on Windows)
    if DATABASES['default']:
        DATABASES['default'].setdefault('OPTIONS', {})
        DATABASES['default']['OPTIONS']['sslmode'] = 'prefer'  # Use SSL if available, fallback if not
# ------------------------------

# ... (EMAIL_BACKEND, LOGGING, etc. unchanged) ...

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
APPEND_SLASH = False


# --- EMAIL CONFIGURATION ---
if DEBUG:
    # For local development: print emails to console instead of sending
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    # For production: use actual SMTP email backend
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.gmail.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'huyuhoybiz@gmail.com')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
# ------------------------------

# --- PRODUCTION SECURITY AND STATIC FILES ---
if not DEBUG:
    # Essential for HTTPS/SSL in production
    SECURE_SSL_REDIRECT = True 
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # WhiteNoise configuration for static files
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
else:
    # Development storage
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'