from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0005_remove_meal_description_and_clear_meals'),
    ]

    operations = [
        migrations.RenameField(
            model_name='meal',
            old_name='withRice',
            new_name='withUnliRice',
        ),
        migrations.RenameField(
            model_name='meal',
            old_name='withOutRice',
            new_name='withoutUnli',
        ),
    ]
