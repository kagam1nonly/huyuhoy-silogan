from django.test import TestCase
from django.urls import reverse
from django.test import override_settings
from .models import Meal

# Create your tests here.
class homePageTest(TestCase):
    def test_home_page(self):
        response = self.client.get(reverse('root'))
        self.assertEqual(response.status_code, 200)

class MealTestCase(TestCase):
    def test_newMeal_added(self):
        numMeal = Meal.objects.count()
        Meal.objects.create(name='Sisilog', withUnliRice='80', withoutUnli='70', pImage='')
        self.assertEqual(Meal.objects.count(), numMeal+1)


class KeepAliveTests(TestCase):
    def test_keepalive_without_token_returns_ok(self):
        response = self.client.get(reverse('api-keepalive'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('status'), 'ok')

    @override_settings(KEEPALIVE_TOKEN='secret-token')
    def test_keepalive_rejects_invalid_token(self):
        response = self.client.get(reverse('api-keepalive'))
        self.assertEqual(response.status_code, 401)

    @override_settings(KEEPALIVE_TOKEN='secret-token')
    def test_keepalive_accepts_valid_token(self):
        response = self.client.get(reverse('api-keepalive'), HTTP_X_KEEPALIVE_TOKEN='secret-token')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('database'), 'ok')
