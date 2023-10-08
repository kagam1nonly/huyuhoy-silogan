from django.db import models

# Create your models here.
class Meal(models.Model):
    name = models.CharField(max_length=120)
    withRice = models.DecimalField(max_digits=10, decimal_places=2)
    withOutRice = models.DecimalField(max_digits=10, decimal_places=2)
    pImage = models.ImageField(upload_to='meal_images/')