from . import views 
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

app_name = 'food'

urlpatterns = [
    path('base/', views.base, name='base'),
    path('adminpanel/', views.adminpanel_view, name='adminpanel'),
    path('adminpanel-order/', views.adminpanelorder_view, name='adminpanel-order'),
    path('meal/', views.meal_view, name='meal'),
    path('order', views.order, name='order'),
    path('success', views.success_view, name='success'),
    path('howtoorder', views.howtoorder, name='howtoorder'),
    path('howtoorder', views.howtoorder, name='conditionofuse'),
    path('privacypolicy', views.privacypolicy, name='privacypolicy'),
    path('clear-session/', views.clear_session, name='clear_session'),
    path('login/', views.login_view, name='login'),  # Custom URL for login
    path('logout/', views.logout_view, name='logout'),  # Custom URL for login
    path('signup/', views.signup, name='signup'),  # Custom URL for signup
    path('view-order/', views.view_order, name='view-order'),  # Custom URL for signup
    path('process-gcash-payment/', views.process_gcash_payment, name='process_gcash_payment'),
    path('cancel-order/<str:order_number>/', views.cancel_order, name='cancel_order'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)