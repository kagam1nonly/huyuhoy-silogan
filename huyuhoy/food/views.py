import json
import random
from django.core.mail import send_mail
from django.db import connection
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from .models import Meal, CartItem, Order, Payment
from .models import CustomUser as User
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login as auth_login
from django.contrib import messages
from django.urls import reverse
from django.db.models.signals import pre_delete
from django.dispatch import receiver
# import logging

# logger = logging.getLogger(__name__)

def generate_random_order_number(length):
    sample = 'ABCDEFGH0123456789'
    return ''.join(random.choice(sample) for i in range(length))

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
            user = form.save(commit=False)
            user.save()
            print(f"User details: {user.username}, {user.email}, {user.first_name}, {user.last_name}, {user.phone}, {user.address}")
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
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            print(user)
            # Redirect to next page if available, otherwise go to index
            next_page = request.GET.get('next', 'index')
            return redirect(next_page)
        else:
            messages.info(request, 'Username or Password is incorrect.')
            print(username)
            print(password)
    
    # Show message if redirected from a protected page
    if 'next' in request.GET:
        messages.info(request, 'Please log in to continue.')
    
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

@csrf_protect
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

            payment = Payment(order=order, payment_status='Unpaid', amount=None, ref_num=None, method=method)
            payment.save()

            order.payment = payment
            order.save()
            
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

@login_required(login_url='login')
def view_order(request):
    orders = Order.objects.filter(customer=request.user)
    user_id = request.user.id
    # Calculate the total bill using the stored procedure
    total_bill = calculate_total_order_amount(user_id)

    if total_bill is not None:
        print("Total bill: ", total_bill)
    else:
        print("Failed to retrieve total bill")

    if not orders:
        print('No orders found for this user.')

    ctx = {'orders': orders, 'total_bill': total_bill}
    return render(request, 'food/view-order.html', ctx)
    
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
            try:
                # Try to get an existing payment for the order
                payment = Payment.objects.get(order=order)
            except Payment.DoesNotExist:
                # If the payment doesn't exist, create a new one
                payment = Payment.objects.create(order=order)

            # Update the payment details
            payment.payment_status = 'Pending'
            payment.amount = amount
            payment.ref_num = ref_num
            payment.method = 'GCASH'  # You may want to set the payment method explicitly
            payment.save()

            order.payment = payment
            order.save()

             # Send email notification to the customer
            payment_send_email(request, order.id)

            return JsonResponse({'success': True, 'message': 'Payment processed successfully'})
        except Order.DoesNotExist:
            print(f"Order not found for order_number: {gorder_number}")
            return JsonResponse({'success': False, 'message': 'Order not found'})
        except Exception as e:
            print(f"Error processing payment: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Error processing payment'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})


from django.shortcuts import get_object_or_404
@csrf_exempt
def cancel_order(request, order_number):
    if request.method == 'POST':
        # Try to get the order object
        order = get_object_or_404(Order, number=order_number, customer=request.user)

        # Check if the order is not in 'Canceled' status
        if order.status != 'Canceled':
            return JsonResponse({
                'success': False,
                'message': 'You cannot delete this order because it is not canceled.'
            })

        # If the order is in 'Canceled' status, proceed with the deletion
        order.delete()
        return JsonResponse({
            'success': True,
            'message': 'Order canceled successfully.'
        })

    return JsonResponse({'success': False, 'message': 'Invalid request method.'})

    return redirect('view-order')

def payment_send_email(request, order_id):
    from django.core.mail import send_mail

    # Retrieve the customer's email and name using the customer_id associated with the order
    try:
        order = Order.objects.get(id=order_id)
        customer_id = order.customer_id
        customer = User.objects.get(id=customer_id)
        customer_name = customer.first_name
        customer_email = customer.email
    except (Order.DoesNotExist, User.DoesNotExist):
        # Handle the case where the order or customer does not exist
        return

    # Compose the payment confirmation message
    subject = f'Payment Confirmation - Order #{order.number}'

    # Greeting for the customer
    customer_greeting = f'Dear {customer_name},\n\n'

    # Greeting for the admin/host
    admin_greeting = f'Dear Admin,\n\n'

    admin_message = f'A payment has been received for order #{order.number}.\n\n' \
                    f'Order Details:\n' \
                    f'Order Number: {order.number}\n' \
                    f'Payment Method: {order.payment.method}\n' \
                    f'Transaction Reference Number: {order.payment.ref_num}\n' \
                    f'Total Amount Paid: {order.bill}\n\n' \
                    f'Customer Details:\n' \
                    f'Customer Name: {customer_name}\n' \
                    f'Customer Email: {customer_email}\n\n' \
                    f'Best regards,\n' \
                    f'Huyuhoy Silogan'

    customer_message = f'We hope this message finds you well. Thank you for choosing Huyuhoy Silogan!\n\n' \
                      f'Your payment has been successfully processed, and we are thrilled to confirm your order #{order.number}.\n\n' \
                      f'Order Details:\n' \
                      f'Order Number: {order.number}\n' \
                      f'Payment Method: {order.payment.method}\n' \
                      f'Transaction Reference Number: {order.payment.ref_num}\n' \
                      f'Total Amount Paid: {order.bill}\n\n' \
                      f'Thank you once again for your order. We look forward to serving you again!\n\n' \
                      f'Best regards,\n' \
                      f'Huyuhoy Silogan'

    # Set the sender email address
    from_email = 'huyuhoy.business@gmail.com'

    # Set the recipient list
    recipient_list = [customer_email, 'huyuhoy.business@gmail.com']  # Add the host email address here

    # Use send_mail to send the email
    send_mail(subject, customer_greeting + customer_message, from_email, [customer_email], fail_silently=False)
    send_mail(subject, admin_greeting + admin_message, from_email, ['huyuhoy.business@gmail.com'], fail_silently=False)

def accept_send_email(request, newid):
    from django.core.mail import send_mail

    # Retrieve the customer's email and name using the customer_id associated with the order
    try:
        order = Order.objects.get(id=newid)
        customer_id = order.customer_id
        cartitems = CartItem.objects.filter(order_id=newid)
        customer = User.objects.get(id=customer_id)
        customer_email = customer.email
    except (Order.DoesNotExist, User.DoesNotExist):
        # Handle the case where the order or customer does not exist
        return

    # Compose the payment confirmation message
    subject = f'Order Accepted - Order #{order.number}'
    message = f'We are pleased to inform you that your order #{order.number} has been accepted.\n\n' \
          f'Thank you for choosing Huyuhoy Silogan! We will begin processing your order shortly.\n\n' \
          f'Order Details:\n' \
          f'Order Number: {order.number}\n'
    # Loop through the cart items and include them in the message
    message += 'Order Items:\n'
    for cartitem in cartitems:
        message += f'- {cartitem.name} - Price: {cartitem.price}\n'

    message += f'\nBest regards,\nHuyuhoy Silogan'

    # Set the sender email address
    from_email = 'huyuhoy.business@gmail.com'

    # Set the recipient list
    recipient_list = [customer_email]

    # Use send_mail to send the email
    send_mail(subject, message, from_email, recipient_list, fail_silently=False)


def adminpanel_view(request):
    if request.method == 'POST':
        users = User.objects.all()
        user_id = request.POST.get('user_id')
        action = request.POST.get('action')
        admin_id = request.user.id


        if not user_id.isdigit():
            return HttpResponseBadRequest("Invalid user_id provided")

        print(f"user_id: {user_id}, action: {action}, admin_id: {admin_id}")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return HttpResponseBadRequest("User not found")

        if action == 'Delete':
            Order.objects.filter(customer=user).delete()
            Payment.objects.filter(order__customer=user).delete()
            user.delete()
            return redirect('adminpanel')

    print(connection.queries)
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

    users = User.objects.all()

    return render(request, 'food/adminpanel.html', {
        'orders': orders,
        'total_revenue': total_revenue,
        'total_ordered_meals': total_ordered_meals,
        'total_customers': total_customers,
        'users': users,
        })


def adminpanelorder_view(request):
    if request.method == 'POST':
        orders = Order.objects.all()
        order_id = int(request.POST.get('order_id'))
        action = request.POST.get('action')
        admin_id = request.user.id

        print(f"order_id: {order_id}, action: {action}, admin_id: {admin_id}")

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=400)

        if action == 'Accept' or action == 'Refuse' or action == 'Complete':
            with connection.cursor() as cursor:
                cursor.callproc('AcceptRefuseOrder', [order_id, (action, 'varchar'), admin_id])
                result = cursor.fetchone()
                print(f"Stored procedure result: {result}")

            if action == 'Accept':
                accept_send_email(request, order.id)

            new_status = order.status
            if action == 'Accept':
                new_status = 'Processing'
            elif action == 'Refuse':
                new_status = 'Refused'
            elif action == 'Complete':
                new_status = 'Completed'

            if action == 'Accept':
                return JsonResponse({'message': f'Order accepted successfully', 'new_status': new_status})
            else:
                return JsonResponse({'message': f'Order {action.lower()}d successfully', 'new_status': new_status})
                
        if action == 'Delete':
            print(f"Deleting Order {order_id}")
            order.delete()
            return JsonResponse({'message': f'Order {order_id} deleted successfully'})

    # Handle the GET request to display orders
    orders = Order.objects.all()
    return render(request, 'food/adminpanel-order.html', {'orders': orders})


from django.db import transaction

@receiver(pre_delete, sender=Payment)
def delete_associated_order(sender, instance, **kwargs):
    def delete_order():
        try:
            # Fetch the related order
            order_id = instance.order.id
            order = Order.objects.get(id=order_id)
            
            # Check if the order status is not 'Pending', 'Completed', or 'Processing'
            if order.status in ['Pending', 'Completed', 'Processing']:
                print(f"Order with id {order_id} cannot be deleted because it is in '{order.status}' status.")
                return HttpResponseBadRequest("Order cannot be deleted because it is in a restricted status.")
            
            # If the status is eligible, proceed with deletion
            order.delete()
            print(f"Successfully deleted Order with id {order_id}")
            
        except Order.DoesNotExist:
            print("Related Order does not exist.")
        except Exception as e:
            print(f"An error occurred: {e}")
    
    # Schedule the delete operation to be executed after the current transaction is committed
    transaction.on_commit(delete_order)

def adminpanelpayment_view(request):
    if request.method == 'POST':
        payments = Payment.objects.all()
        payment_id = request.POST.get('payment_id')
        action = request.POST.get('action')
        admin_id = request.user.id

        print(f"payment_id: {payment_id}, action: {action}, admin_id: {admin_id}")

        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return HttpResponseBadRequest("Payment not found")

        if action == 'Confirm':
            with connection.cursor() as cursor:
                cursor.callproc('ConfirmPayment', [(payment_id, 'integer')])
                result = cursor.fetchone()
                print(f"Stored procedure result: {result}")
                return redirect('adminpanel-payment')
                
        if action == 'Delete':
            payment.delete()
            print(f"Deleting Payment {payment_id}")
            return redirect('adminpanel-payment')

    payments = Payment.objects.all()
    return render(request, 'food/adminpanel-payment.html', {'payments': payments})
