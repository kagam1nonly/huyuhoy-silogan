from django.contrib import admin
from .models import Meal, Order, CartItem, Customer

class MealAdmin(admin.ModelAdmin):
    list_display = ('name', 'withRice', 'withOutRice')

# Register your models here.
admin.site.register(Meal, MealAdmin)
admin.site.register(Order)
admin.site.register(CartItem)
admin.site.register(Customer)