from . import views 
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'food'

urlpatterns = [
    path('base/', views.base, name='base'),
    path('meal/', views.meal_view, name='meal'),
    path('order', views.order, name='order'),
    path('success', views.success_view, name='success'),
    path('clear-session/', views.clear_session, name='clear_session'),
    path('login/', views.login_view, name='login'),  # Custom URL for login
    path('logout/', views.logout_view, name='logout'),  # Custom URL for login
    path('signup/', views.signup, name='signup'),  # Custom URL for signup
    path('view-order/', views.view_order, name='view-order'),  # Custom URL for signup
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)