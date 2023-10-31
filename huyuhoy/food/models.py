from django.db import models
from django.contrib.auth.models import User

# Meal Model.
class Meal(models.Model):
    meal_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    withRice = models.DecimalField(max_digits=10, decimal_places=2)
    withOutRice = models.DecimalField(max_digits=10, decimal_places=2)
    pImage = models.ImageField(upload_to='meal_images/')

    def __str__(self):
        return self.name
    
# Order Model
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    number = models.CharField(max_length=60)
    bill = models.DecimalField(max_digits=4, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True, blank=True)
    note = models.TextField(blank=True, null= True)

# CartItem Model 
class CartItem(models.Model):
    cartitem_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    rice = models.CharField(max_length=60)
    price = models.DecimalField(decimal_places=2, max_digits=10)
    order = models.ForeignKey('Order', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

# CustomUser Model
class CustomUser(models.Model):
    email = models.EmailField(unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add any additional user-related fields you need
    # For example, you can add fields like profile picture, address, etc.

    def __str__(self):
        return self.user.username
    
# # CartItem Model 
# class CartItem(models.Model):
#     cart_item_id = models.AutoField(primary_key=True, default=1)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link cart items to a user
#     meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField(default=1)

#     def __str__(self):
#         return f"{self.meal.name} ({self.quantity}x)"