from django.test import TestCase
from django.urls import reverse
from .models import Meal

# Create your tests here.
class homePageTest(TestCase):
    def test_home_page(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

class MealTestCase(TestCase):
    def test_newMeal_added(self):
        numMeal = Meal.objects.count()
        Meal.objects.create(name='Sisilog', withRice='80', withOutRice='70', pImage='')
        self.assertEqual(Meal.objects.count(), numMeal+1)
