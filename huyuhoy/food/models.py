from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Meal(models.Model):
    meal_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    withRice = models.DecimalField(max_digits=10, decimal_places=2)
    withOutRice = models.DecimalField(max_digits=10, decimal_places=2)
    pImage = models.ImageField(upload_to='meal_images/')

    def __str__(self):
        return self.name

class CartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True, default=1)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link cart items to a user
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.meal.name} ({self.quantity}x)"

# Create your custom user profile model
class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add any additional user-related fields you need
    # For example, you can add fields like profile picture, address, etc.

    def __str__(self):
        return self.user.username