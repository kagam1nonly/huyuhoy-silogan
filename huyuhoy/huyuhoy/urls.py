from django.contrib import admin
from django.urls import path, include
from food import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('meal/', views.meal_view, name='meal'),
    path('order/', views.order_view, name='order'),
    path('food/', include('food.urls', namespace='food')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)