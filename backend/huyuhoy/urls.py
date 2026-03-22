from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def root_view(request):
    return JsonResponse(
        {
            'name': 'Huyuhoy Silogan Backend',
            'status': 'ok',
            'api_health': '/api/health/',
            'frontend_dev': settings.CORS_ALLOWED_ORIGINS[0] if getattr(settings, 'CORS_ALLOWED_ORIGINS', None) else 'http://localhost:5173',
        }
    )

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('food.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)