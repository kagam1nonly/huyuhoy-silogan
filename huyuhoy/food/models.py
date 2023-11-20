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
    
class Address(models.Model):
    address_id = models.AutoField(primary_key=True)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} {self.postal_code}"
        

# Order Model
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
        ('Processing', 'Processing'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    number = models.CharField(max_length=6, unique=True)  # Make it unique
    bill = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)


# CartItem Model 
class CartItem(models.Model):
    cartitem_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    rice = models.CharField(max_length=60)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='cart_items')

    def __str__(self):
        return self.name

# Customer Model
class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    