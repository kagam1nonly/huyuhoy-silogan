from django.db import migrations
from django.contrib.auth import get_user_model

def create_superuser(apps, schema_editor):
    User = get_user_model()
    if not User.objects.filter(username='kagamipro').exists():
        User.objects.create_superuser(
            username='kagamipro',
            email='jamespiastro20@gmail.com', # Use any email
            password='zetsu123'
        )

class Migration(migrations.Migration):
    dependencies = [
        ('food', '0001_initial'), # Make sure this matches your previous migration file
        ('food', '0002_alter_order_payment'), # Make sure this matches your previous migration file
    ]
    operations = [
        migrations.RunPython(create_superuser),
    ]