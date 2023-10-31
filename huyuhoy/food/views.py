import json, random
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .models import Meal, CartItem, Order
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.sessions.models import Session
from .forms import CustomUserCreationForm  
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login as auth_login
from django.contrib import messages

def randomOrderNumber(length):
    sample = 'ABCDEFGH0123456789'
    numberO = ''.join(random.choice(sample) for i in range(length))
    return numberO

def base(request):
    return render(request, 'food/base.html')

def index(request):
    request.session.set_expiry(0)
    if 'orders' in request.session:
        print(request.session['orders'])
    return render(request, 'food/index.html')

def signup(request):  
    ctx = {}
    if request.method == 'POST':  
        form = CustomUserCreationForm(request.POST)  
        if form.is_valid():  
            form.save()  
        else:  
            ctx['form'] = form
    else:
        form = CustomUserCreationForm()
        ctx['form'] = form
    return render(request, 'food/signup.html', ctx)

@csrf_protect
def login_view(request):
    request.session.set_expiry(0)
    if request.method == 'POST':
        username = request.POST.get('username')
        pwd = request.POST.get('password')
        user = authenticate(request, username=username, password=pwd)  # Use 'username' as the field to authenticate
        if user is not None:
            auth_login(request, user)
            print(user)
            print(pwd)
            return render(request, 'food/index.html', context={'user': request.user})  # Redirect to the index page upon successful login
        else:
            messages.info(request, 'Username or Password is incorrect.')
            print(user)
            print(pwd)
    return render(request, 'food/login.html')

def logout_view(request):
    logout(request)
    return redirect('index')

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
        request.session['orders'] = request.POST.get('orders')
        request.session['bill'] = request.POST.get('bill')
        orders = json.loads(request.session['orders'])
        randomNum = randomOrderNumber(6)

        while Order.objects.filter(number=randomNum).count() > 0:
            randomNum = randomOrderNumber(6)
            
        print(request.session['orders'])
        print(request.session['note'])
        print(request.session['bill'])
        if request.user.is_authenticated:
            order = Order(customer=request.user,
                            number=randomOrderNumber(6),
                            bill=float(request.session['bill']),
                            note=request.session['note'])    
            order.save()
            for article in orders:
                rice_choice = article.get('rice', '')  # Get the value of 'rice' from the article
                rice = 'withRice' if rice_choice.lower() == 'withrice' else 'withOutRice'  # Choose 'withRice' or 'withOutRice' based on the value
                item = CartItem(
                    order=order,
                    name=article['name'],
                    price=float(article['price']),
                    rice=rice  # Assign the chosen rice option
                )
                item.save()

        return JsonResponse({'message': 'This is an AJAX request.'})
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
        order = request.session['orders']
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
    
