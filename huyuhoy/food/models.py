from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser, Group, Permission
from decimal import Decimal # Recommended for safety

# --- CORE MODELS ---

# Meal Model.
class Meal(models.Model):
    meal_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    withRice = models.DecimalField(max_digits=10, decimal_places=2)
    withOutRice = models.DecimalField(max_digits=10, decimal_places=2)
    pImage = models.ImageField(upload_to='meal_images/')

    def __str__(self):  
        return self.name
        
# Payment Model
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('COD', 'Cash on Delivery'),
        ('GCASH', 'GCash'),
        ('CASH', 'Cash'),
        # Add more payment methods if needed
    )
    PAYMENT_STATUS_CHOICES = (
        ('Unpaid', 'Unpaid'),
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    )

    order = models.OneToOneField('Order', on_delete=models.CASCADE, null=True, related_name='payment_order')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # FIX: Increased max_length from 13 to 30 to prevent DataError on save.
    ref_num = models.CharField(max_length=30, null=True, blank=True, default='') 
    
    # FIX: Increased max_length from 5 to 10 for method to accommodate new payment methods (e.g., 'PAYPAL').
    method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, null=True, default='Cash')
    
    def __str__(self):
        return f"Payment for Order #{self.order.number if self.order else 'N/A'} - {self.payment_status}"
        
# Order Model
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
        ('Processing', 'Processing'),
    )

    TRANSACTION_CHOICES = (
        ('Delivery', 'Delivery'),
        ('Pickup', 'Pickup'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    number = models.CharField(max_length=6, unique=True)  # Make it unique
    bill = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    transaction = models.CharField(max_length=10, choices=TRANSACTION_CHOICES, default='Pickup')
    payment = models.OneToOneField('Payment', on_delete=models.CASCADE, null=True, blank=True, related_name='order_payment')
    address = models.CharField(max_length=120, null=True, default='')

    def __str__(self):
        return f"Order #{self.number} by {self.customer.username}"

# CartItem Model  
class CartItem(models.Model):
    cartitem_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    rice = models.CharField(max_length=60)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='cart_items')

    def __str__(self):
        return self.name

# Custom User Model
class CustomUser(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    # Required fields for using AbstractUser with custom fields
    # Ensure you have your related_name defined correctly if using custom User model
    groups = models.ManyToManyField(Group, related_name='custom_user_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set', blank=True)