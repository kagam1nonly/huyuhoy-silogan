from django.contrib import admin
from django.urls import path, include
from food import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('base/', views.base, name='base'),
    path('meal/', views.meal_view, name='meal'),
    path('order/', views.order, name='order'),
    path('success/', views.success_view, name='success'),
    path('food/', include('food.urls', namespace='food')),
    path('clear-session/', views.clear_session, name='clear_session'),
    path('login/', views.login_view, name='login'),  # Add this line for the login view
    path('logout/', views.logout_view, name='logout'),  # Custom URL for login
    path('signup/', views.signup, name='signup'),
    path('view-order/', views.view_order, name='view-order'),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)