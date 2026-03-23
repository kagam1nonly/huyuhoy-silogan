from decimal import Decimal

from django.core.management.base import BaseCommand

from food.models import Meal


MEALS = [
    {"name": "Sisilog", "withRice": Decimal("99.00"), "withOutRice": Decimal("89.00"), "pImage": "meal_images/sisilog.png"},
    {"name": "Pork Silog", "withRice": Decimal("105.00"), "withOutRice": Decimal("95.00"), "pImage": "meal_images/porksilog.png"},
    {"name": "Bang Silog", "withRice": Decimal("85.00"), "withOutRice": Decimal("75.00"), "pImage": "meal_images/bangsilog.png"},
    {"name": "Corn Silog", "withRice": Decimal("79.00"), "withOutRice": Decimal("69.00"), "pImage": "meal_images/cornsilog.png"},
    {"name": "Tuna Silog", "withRice": Decimal("99.00"), "withOutRice": Decimal("89.00"), "pImage": "meal_images/tunasilog.png"},
    {"name": "Hot Silog", "withRice": Decimal("70.00"), "withOutRice": Decimal("60.00"), "pImage": "meal_images/hotsilog.png"},
    {"name": "Spam Silog", "withRice": Decimal("110.00"), "withOutRice": Decimal("100.00"), "pImage": "meal_images/spamsilog.png"},
    {"name": "Quarterpound Beef Patty", "withRice": Decimal("120.00"), "withOutRice": Decimal("110.00"), "pImage": "meal_images/quarterpound.png"},
    {"name": "Pork Steak", "withRice": Decimal("105.00"), "withOutRice": Decimal("95.00"), "pImage": "meal_images/porksteak.png"},
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
                    "withRice": meal_data["withRice"],
                    "withOutRice": meal_data["withOutRice"],
                    "pImage": meal_data["pImage"],
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Meals seeded. Created={created_count}, Updated={updated_count}"))
