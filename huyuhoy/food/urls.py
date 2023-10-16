from . import views 
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'food'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('meal/', views.meal_view, name='meal'),
    path('order/', views.order_view, name='order'),
    path('remove_item/', views.remove_item, name='remove_item'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)