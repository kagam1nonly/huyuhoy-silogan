from decimal import Decimal

from django.core.management.base import BaseCommand

from food.models import Meal


MEALS = [
    {"name": "Sisilog", "withUnliRice": Decimal("99.00"), "withoutUnli": Decimal("89.00"), "pImage": "meal_images/sisilog.png"},
    {"name": "Pork Silog", "withUnliRice": Decimal("105.00"), "withoutUnli": Decimal("95.00"), "pImage": "meal_images/porksilog.png"},
    {"name": "Bang Silog", "withUnliRice": Decimal("85.00"), "withoutUnli": Decimal("75.00"), "pImage": "meal_images/bangsilog.png"},
    {"name": "Corn Silog", "withUnliRice": Decimal("79.00"), "withoutUnli": Decimal("69.00"), "pImage": "meal_images/cornsilog.png"},
    {"name": "Tuna Silog", "withUnliRice": Decimal("99.00"), "withoutUnli": Decimal("89.00"), "pImage": "meal_images/tunasilog.png"},
    {"name": "Hot Silog", "withUnliRice": Decimal("70.00"), "withoutUnli": Decimal("60.00"), "pImage": "meal_images/hotsilog.png"},
    {"name": "Spam Silog", "withUnliRice": Decimal("110.00"), "withoutUnli": Decimal("100.00"), "pImage": "meal_images/spamsilog.png"},
    {"name": "Quarterpound Beef Patty", "withUnliRice": Decimal("120.00"), "withoutUnli": Decimal("110.00"), "pImage": "meal_images/quarterpound.png"},
    {"name": "Pork Steak", "withUnliRice": Decimal("105.00"), "withoutUnli": Decimal("95.00"), "pImage": "meal_images/porksteak.png"},
]


class Command(BaseCommand):
    help = "Seed default meals for initial deployments."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for meal_data in MEALS:
            meal, created = Meal.objects.update_or_create(
                name=meal_data["name"],
                defaults={
                    "withUnliRice": meal_data["withUnliRice"],
                    "withoutUnli": meal_data["withoutUnli"],
                    "pImage": meal_data["pImage"],
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Meals seeded. Created={created_count}, Updated={updated_count}"))
