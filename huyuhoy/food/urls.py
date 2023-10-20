from . import views 
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'food'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('meal/', views.meal_view, name='meal'),
    path('order', views.order, name='order'),
    path('success', views.success_view, name='success'),
    path('add_to_cart', views.add_to_cart, name='add_to_cart'),
    path('add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('remove_item_from_cart', views.remove_item_from_cart, name='remove_item_from_cart'),
    path('clear-session/', views.clear_session, name='clear_session'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)