# Generated by Django 4.2.6 on 2023-11-20 15:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0006_alter_order_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('address_id', models.AutoField(primary_key=True, serialize=False)),
                ('street', models.CharField(max_length=255)),
                ('city', models.CharField(max_length=120)),
                ('state', models.CharField(max_length=120)),
                ('postal_code', models.CharField(max_length=20)),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='shipping_address',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='food.address'),
        ),
    ]