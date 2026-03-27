from django.db import migrations


def clear_meals(apps, schema_editor):
    Meal = apps.get_model('food', 'Meal')
    Meal.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0004_meal_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='meal',
            name='description',
        ),
        migrations.RunPython(clear_meals, migrations.RunPython.noop),
    ]
