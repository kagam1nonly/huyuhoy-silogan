import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .models import Meal, CartItem
from django.views.decorators.csrf import csrf_exempt

# Import the Session model from your Django app
from django.contrib.sessions.models import Session

def index(request):
    request.session.set_expiry(0)
    if 'orders' in request.session:
        print(request.session['orders'])
    return render(request, 'food/index.html')

def login_view(request):
    request.session.set_expiry(0)
    return render(request, 'food/login.html')

def meal_view(request):
    request.session.set_expiry(0)

    if 'order' not in request.session:
        request.session['order'] = []

    meals = Meal.objects.all()
    ctx = {'meals': meals}
    return render(request, 'food/meal.html', ctx)

@csrf_exempt
def order(request):
    request.session.set_expiry(0)
    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        request.session['note'] = request.POST.get('note')
        
        # Use 'order' instead of 'orders'
        request.session['order'] = json.loads(request.POST.get('order'))
        
        # Send a JSON response indicating success
        return JsonResponse({'message': 'Order submitted successfully'}, status=200)

    ctx = {'active_link': 'order'}
    return render(request, 'food/order.html', ctx)

def clear_session(request):
    # Clear the session
    request.session.flush()

    # You can return an HTTP response or redirect to another page
    return HttpResponse('Session cleared.')

def success_view(request):
    request.session.set_expiry(0)
    
    if 'order' in request.session:
        order = request.session['order']
        ctx = {'order': order}
        return render(request, 'food/success.html', ctx)
    else:
        return HttpResponse('No order found in the session.')

def add_to_cart(request):
    if request.method == 'POST':
        # Parse the JSON request body
        try:
            payload = json.loads(request.body.decode('utf-8'))
            meal_id = payload.get('meal_id')
            quantity = payload.get('quantity')
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON payload'})

        if meal_id is not None:
            meal_id = int(meal_id)
        else:
            return JsonResponse({'success': False, 'message': 'Meal ID is missing'})

        user = request.user  # Assuming the user is authenticated

        order = request.session.get('order', [])
        order.append({'meal_id': meal_id, 'quantity': quantity})
        request.session['order'] = order

        try:
            meal = Meal.objects.get(meal_id=meal_id)

            # Create a new CartItem record
            cart_item, created = CartItem.objects.get_or_create(user=user, meal=meal)
            cart_item.quantity += quantity
            cart_item.save()
            print('Added to cart')
            return JsonResponse({'success': True})
        except Meal.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Meal not found'})

    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def remove_item_from_cart(request, item_id):
    try:
        item = CartItem.objects.get(pk=item_id)
        item.delete()
        return JsonResponse({'message': 'Item removed successfully'})
    except CartItem.DoesNotExist:
        return JsonResponse({'message': 'Item not found'}, status=404)
