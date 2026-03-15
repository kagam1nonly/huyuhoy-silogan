from django.contrib import admin
from django.urls import path, include
from food import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('adminpanel/', views.adminpanel_view, name='adminpanel'),
    path('adminpanel-order/', views.adminpanelorder_view, name='adminpanel-order'),
    path('adminpanel-payment/', views.adminpanelpayment_view, name='adminpanel-payment'),
    path('', views.index, name='index'),
    path('howtoorder', views.howtoorder, name='howtoorder'),
    path('howtoorder', views.howtoorder, name='conditionofuse'),
    path('privacypolicy', views.privacypolicy, name='privacypolicy'),
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
    path('process-gcash-payment/', views.process_gcash_payment, name='process_gcash_payment'),
    path('cancel-order/<str:order_number>/', views.cancel_order, name='cancel_order'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)