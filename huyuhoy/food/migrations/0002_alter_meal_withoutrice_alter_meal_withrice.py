# Generated by Django 4.2.5 on 2023-10-02 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meal',
            name='withOutRice',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='meal',
            name='withRice',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]
