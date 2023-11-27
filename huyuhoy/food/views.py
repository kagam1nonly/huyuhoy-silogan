import json
import random
from django.core.mail import send_mail
from django.db import connection
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .models import Meal, CartItem, Order, Customer, Payment
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login as auth_login
from django.contrib import messages
from django.urls import reverse
# import logging

# logger = logging.getLogger(__name__)

def generate_random_order_number(length):
    sample = 'ABCDEFGH0123456789'
    return ''.join(random.choice(sample) for i in range(length))

def adminpanel_view(request):
    return render(request, 'food/adminpanel.html')

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

@csrf_exempt
def login_view(request):
    request.session.set_expiry(0)
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            print(user)
            return render(request, 'food/index.html', context={'user': request.user})
        else:
            messages.info(request, 'Username or Password is incorrect.')
            print(username)
            print(password)
    return render(request, 'food/login.html')

def logout_view(request):
    logout(request)
    return redirect('index')

def howtoorder(request):
    logout(request)
    return render(request, 'food/howtoorder.html')

def conditionofuse(request):
    logout(request)
    return render(request, 'food/howtoorder.html')

def privacypolicy(request):
    logout(request)
    return render(request, 'food/privacypolicy.html')

def meal_view(request):
    request.session.set_expiry(0)

    if 'order' not in request.session:
        request.session['order'] = []

    meals = Meal.objects.all()
    isAuthenticated = request.user.is_authenticated
    print(isAuthenticated)

    ctx = {'meals': meals, 'isAuthenticated': isAuthenticated}
    return render(request, 'food/meal.html', ctx)


@csrf_exempt
def order(request):
    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        orders = json.loads(request.POST.get('orders', '[]'))
        note = request.POST.get('note', '')
        bill = float(request.POST.get('bill', 0))
        random_order_number = generate_random_order_number(6)

        while Order.objects.filter(number=random_order_number).count() > 0:
            random_order_number = generate_random_order_number(6)

        if request.user.is_authenticated:
            transaction=request.POST.get('transaction', '')
            address=request.POST.get('address', '')
            method=request.POST.get('payment_method', '')

            print(transaction)
            
            # Set the default status to 'Pending'
            status = 'Pending'

            if transaction.lower() == 'pickup':
                status = 'Processing'
                method = 'CASH'

            if transaction.lower() == 'delivery' and method == 'COD':
                status = 'Processing'

            order = Order(
                customer=request.user,
                number=random_order_number,
                bill=bill,
                note=note,
                status=status,
                transaction=transaction,
                address=address,
            )
            order.save()

            payment = Payment(order=order, amount=None, ref_num=None, method=method)
            payment.save()

            for article in orders:
                rice_choice = article.get('rice', '')
                rice = 'withRice' if rice_choice.lower() == 'with rice' else 'withOutRice'
                item = CartItem(
                    order=order,
                    name=article['name'],
                    price=float(article['price']),
                    rice=rice
                )
                item.save()
                print(rice)

            # Set the 'order' and 'bill' in the session
            request.session['order'] = random_order_number
            request.session['bill'] = bill
            request.session['note'] = note

            return JsonResponse({'message': 'Order placed successfully.'})
        else:
            return JsonResponse({'message': 'User not authenticated.'})

    ctx = {'active_link': 'order'}
    return render(request, 'food/order.html', ctx)

def success_view(request):
    request.session.set_expiry(0)
 
    if 'order' in request.session:
        orderNum = request.session['order']
        bill = request.session['bill']
        items = CartItem.objects.filter(order__number = orderNum)
        print(f"Order Number: {orderNum}, Bill: {bill}")
        print(f"Items: {items}")
        ctx = {'orderNum': orderNum, 'bill': bill, 'items': items}
        return render(request, 'food/success.html', ctx)
    else:
        return HttpResponse('No order found in the session.')


def clear_session(request):
    # Clear the session
    request.session.flush()

    # You can return an HTTP response or redirect to another page
    return HttpResponse('Session cleared.')

def calculate_total_order_amount(user_id):
    print("user_id:", user_id)
    with connection.cursor() as cursor:
        try:
            # Verify the user_id before calling the stored procedure

            cursor.callproc('CalculateTotalBillForCustomer', [user_id])
            print("Stored procedure called successfully")
            result = cursor.fetchone()
            print("Total Amount:", result[0])
            
            return result[0]
        except Exception as e:
            print("Error:", e)
            return None

@login_required
def view_order(request):
    if request.user.is_authenticated:
        orders = Order.objects.filter(customer=request.user)
        user_id = request.user.id
        # Calculate the total bill using the stored procedure
        total_bill = calculate_total_order_amount(user_id)

        if total_bill is not None:
            print("Total bill: ", total_bill)
        else:
            print("Failed to retrieve total bill")

        if not orders:
            print('Please log in to view your orders.')

        ctx = {'orders': orders, 'total_bill': total_bill}
        return render(request, 'food/view-order.html', ctx)
    else:
        return HttpResponse('Please log in to view your orders.')
    
@csrf_exempt
def process_gcash_payment(request):
    if request.method == 'POST':
        amount = request.POST.get('amount')
        ref_num = request.POST.get('ref_num')
        gorder_number = request.POST.get('order_number')
        print(f"Received amount: {amount}")
        print(f"Received ref_num: {ref_num}")
        print(f"Received order_number: {gorder_number}")

        try:
            # Retrieve the customer ID from the current user
            customer_id = request.user.id

            # Find the order based on the order number and customer ID
            order = Order.objects.get(number=gorder_number, customer_id=customer_id)
            print(f"Found Order: {order}")

            # Check if a payment already exists for the order
            payment, created = Payment.objects.get_or_create(order=order)

            # Update the payment details
            payment.amount = amount
            payment.ref_num = ref_num
            payment.method = 'GCASH'  # You may want to set the payment method explicitly
            payment.save()
            return JsonResponse({'success': True, 'message': 'Payment processed successfully'})
        except Order.DoesNotExist:
            print(f"Order not found for order_number: {gorder_number}")
            return JsonResponse({'success': False, 'message': 'Order not found'})
        except Exception as e:
            print(f"Error processing payment: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Error processing payment'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def cancel_order(request, order_number):
    if request.method == 'POST':
        try:
            # Retrieve the customer ID (you may need to adapt this part)
            customer_id = request.user.id

            with connection.cursor() as cursor:
                # Call the stored procedure to cancel the order
                cursor.callproc('CancelCustomerOrder', [order_number, customer_id])
                cursor.execute('SELECT @result;')
                result = cursor.fetchone()[0]

            # Check if the cancellation was successful
            if result == 'Order canceled successfully':
                # Remove the order
                try:
                    order = Order.objects.get(number=order_number, customer=customer_id)
                    order.delete()
                except Order.DoesNotExist:
                    print('No order id found')
                    pass  # Handle the case where the order is already deleted or not found

            print('Outside if')
            return redirect('view-order')
        except Exception as e:
            return JsonResponse({'success': False, 'error_message': str(e)})

    return redirect('view-order')

def send_email(request, order_id):
    subject = 'Order Completed'
    message = 'Your order is completed.'
    from_email = 'huyuhoy.business@gmail.com'

    # Retrieve the customer's email using the customer_id associated with the order
    try:
        order = Order.objects.get(id=order_id)
        customer_id = order.customer_id
        customer = User.objects.get(id=customer_id)
        recipient_list = [customer.email]  # Use the customer's email as the recipient
    except (Order.DoesNotExist, User.DoesNotExist):
        recipient_list = []  # Set an empty recipient list if the order or customer does not exist

    send_mail(subject, message, from_email, recipient_list, fail_silently=False)

def adminpanel_view(request):
    orders = Order.objects.all()  # You can add filters as needed

    # Calculate Total Revenue
    with connection.cursor() as cursor:
        cursor.execute('SELECT CalculateTotalRevenue()')
        total_revenue = cursor.fetchone()[0]

    # Calculate Total Ordered Meals
    with connection.cursor() as cursor:
        cursor.execute('SELECT CalculateTotalOrderedMeals()')
        total_ordered_meals = cursor.fetchone()[0]

    # Calculate Total Customers
    with connection.cursor() as cursor:
        cursor.execute('SELECT CalculateTotalCustomers()')
        total_customers = cursor.fetchone()[0]

    return render(request, 'food/adminpanel.html', {
        'orders': orders,
        'total_revenue': total_revenue,
        'total_ordered_meals': total_ordered_meals,
        'total_customers': total_customers,
        })

def adminpanelorder_view(request):
    if request.method == 'GET':
        orders = Order.objects.all()
        # Fetch orders and messages from the messages table
        with connection.cursor() as cursor:
            messages = None  # Initialize messages as None

        # Pass the orders and messages to the template context
        return render(request, 'food/adminpanel-order.html', {'orders': orders, 'messages': messages})

    if request.method == 'POST':
        orders = Order.objects.all()
        order_id = int(request.POST.get('order_id'))
        action = request.POST.get('action')
        admin_id = request.user.id  # Get the admin's ID from the request or another source

        if not admin_id:
            return JsonResponse({'success': False, 'message': 'Admin not authenticated.'})

        # Check if the order status allows the action
        order = Order.objects.get(id=order_id)

        if action == 'Delete':
            try:
                order.delete()
                return redirect('adminpanel-order')
            except Order.DoesNotExist:
                return redirect('adminpanel-order')
            
        if action == 'complete':
            with connection.cursor() as cursor:
                cursor.execute("SELECT message FROM messages")
                messages = cursor.fetchone()
                messages = messages[0] if messages else None  # Extract the message if it exists

                # Send the completion email
                if messages:
                    try:
                        send_email(request, order_id)  # Send the email to the customer
                    except Exception as e:
                        # Handle the email sending error, e.g., log it
                        print(f"Error sending email: {str(e)}")

                messages = ('Email sent.',) if messages else ('Email not sent.',)
                return render(request, 'food/adminpanel-order.html', {'orders': orders, 'messages': messages})
            
        if order.status not in ('Pending', 'Processing'):
            # Execute the message retrieval
            with connection.cursor() as cursor:
                cursor.execute("SELECT message FROM messages")
                messages = cursor.fetchone()
                messages = messages[0] if messages else None  # Extract the message if it exists
                messages = ('Cannot perform this action on the order',) if messages else ('Cannot perform this action on the order',)
                return render(request, 'food/adminpanel-order.html', {'orders': orders, 'messages': messages})

        else:
            with connection.cursor() as cursor:
                cursor.callproc('AcceptRefuseOrder', [order_id, action, admin_id])
                result = cursor.fetchone()
                if isinstance(result[0], str) and 'successfully' in result[0]:
                    return redirect('adminpanel-order')
                else:
                    return redirect('adminpanel-order')
    return redirect('adminpanel-order')