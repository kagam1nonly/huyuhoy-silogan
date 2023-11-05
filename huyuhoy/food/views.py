import json, random
from django.db import connection
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .models import Meal, CartItem, Order, Customer
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.sessions.models import Session
from .forms import CustomUserCreationForm  
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login as auth_login
from django.contrib import messages
from django.urls import reverse

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
            user = form.save()
            print(f"User details: {user.username}, {user.email}, {user.first_name}, {user.last_name}")
            print('Success')

            return redirect(reverse('login'))
        else:
            print(form.errors)
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
    isAuthenticated = request.user.is_authenticated  # Check if the user is authenticated
    print(isAuthenticated)

    ctx = {'meals': meals, 'isAuthenticated': isAuthenticated}
    return render(request, 'food/meal.html', ctx)

def call_place_order_procedure(customer_id, cart_items):
    with connection.cursor() as cursor:
        try:
            # Call the PlaceOrder stored procedure
            cursor.callproc('PlaceOrder', [customer_id, cart_items])

            # Commit the changes
            cursor.execute('COMMIT;')
            return True  # Indicates success
        except Exception as e:
            return False  # Indicates failure

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

def success_view(request):
    request.session.set_expiry(0)
    
    if 'order' in request.session:
        orderNum = request.session['order']
        bill = request.session['bill']
        items = CartItem.objects.filter(order__number = orderNum)
        ctx = {'orderNum': orderNum, 'bill': bill, 'items': items}
        return render(request, 'food/success.html', ctx)
    else:
        return HttpResponse('No order found in the session.')

def clear_session(request):
    # Clear the session
    request.session.flush()

    # You can return an HTTP response or redirect to another page
    return HttpResponse('Session cleared.')

@login_required  # Ensure the user is logged in to access this view
def view_order(request):
    if request.user.is_authenticated:
        # Query the database to get orders related to the logged-in user
        orders = Order.objects.filter(customer=request.user)

        if not orders:
            print('Please log in to view your orders.')
        
        ctx = {'orders': orders}
        return render(request, 'food/view-order.html', ctx)
    else:
        # Handle the case when the user is not logged in
        # You can redirect them to a login page or show an appropriate message
        return HttpResponse('Please log in to view your orders.')
    