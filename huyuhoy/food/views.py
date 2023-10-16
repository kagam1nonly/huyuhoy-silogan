import json
from django.shortcuts import render
from django.http import JsonResponse
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

def order_view(request):
    
    return render(request, 'food/order.html')    

def remove_item(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        index = data.get('index')
        # Remove the item from the server-side cart here

        # Send a JSON response indicating success
        return JsonResponse({'message': 'Item removed successfully'}, status=200)