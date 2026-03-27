from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0006_rename_meal_unli_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='meal',
            name='isHot',
            field=models.BooleanField(default=False),
        ),
    ]
