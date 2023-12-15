# Generated by Django 4.2.7 on 2023-12-10 08:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Meal',
            fields=[
                ('meal_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=120)),
                ('withRice', models.DecimalField(decimal_places=2, max_digits=10)),
                ('withOutRice', models.DecimalField(decimal_places=2, max_digits=10)),
                ('pImage', models.ImageField(upload_to='meal_images/')),
            ],
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=6, unique=True)),
                ('bill', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('note', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Canceled', 'Canceled'), ('Processing', 'Processing')], default='Pending', max_length=10)),
                ('transaction', models.CharField(choices=[('Delivery', 'Delivery'), ('Pickup', 'Pickup')], default='Pickup', max_length=10)),
                ('address', models.CharField(default='', max_length=120, null=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('payment_status', models.CharField(choices=[('Unpaid', 'Unpaid'), ('Paid', 'Paid'), ('Failed', 'Failed')], default='Unpaid', max_length=10)),
                ('amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('ref_num', models.CharField(blank=True, default='', max_length=13, null=True)),
                ('method', models.CharField(choices=[('COD', 'Cash on Delivery'), ('GCASH', 'GCash'), ('CASH', 'Cash')], default='Cash', max_length=5, null=True)),
                ('order', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment_order', to='food.order')),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='payment',
            field=models.OneToOneField(default='', on_delete=django.db.models.deletion.CASCADE, related_name='order_payment', to='food.payment'),
        ),
        migrations.CreateModel(
            name='CartItem',
            fields=[
                ('cartitem_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=120)),
                ('rice', models.CharField(max_length=60)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cart_items', to='food.order')),
            ],
        ),
    ]
