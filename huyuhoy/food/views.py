from django.shortcuts import render
from django.http import HttpResponse
from .models import Meal

# Create your views here.

def index(request):
    return render(request, 'food/index.html')

def login_view(request):
    return render(request, 'food/login.html')

def meal_view(request):
    meals = Meal.objects.all()
    ctx = {'meals' : meals}
    print(meals)
    return render(request, 'food/meal.html', ctx)