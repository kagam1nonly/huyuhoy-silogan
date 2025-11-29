# Huyuhoy Silogan - AI Assistant Guidelines

## Project Overview
A Django-based food ordering system with role-based access (customers, admins), PostgreSQL backend, and payment integration (Cash on Delivery, GCash). The app manages a meal catalog, order lifecycle, payments, and admin operations.

**Key Files:**
- `food/models.py` - Data models (Meal, Order, Payment, CartItem, CustomUser)
- `food/views.py` - Request handlers and business logic
- `huyuhoy/settings.py` - Django configuration, database, email, static files
- `food/urls.py` - Route definitions

## Architecture & Data Flow

### Authentication & Users
- **Custom User Model:** `CustomUser` (extends AbstractUser) with phone, address fields
- Uses Django's built-in auth system with email-based login/signup
- Stored in PostgreSQL (settings.py uses RDS endpoint, not MySQL despite requirements.txt)
- Reference: `food/forms.py::CustomUserCreationForm` validates phone, address, name format

### Order Processing Pipeline
1. Customer browses meals (`meal_view`) - stored in session
2. Customer adds items to cart (client-side JS: `cart.js`, `filter.js`)
3. Submits order via AJAX POST to `order()` - generates unique 6-char alphanumeric order number
4. Creates Order + Payment + CartItems records; status depends on transaction type:
   - **Pickup** → "Processing" (cash only)
   - **Delivery + COD** → "Processing"
   - **Delivery + GCash** → "Pending" (awaits payment ref confirmation)
5. Session stores order number/bill for success page display

### Admin Order Workflow
- Admin views all orders via `adminpanel_view`
- AJAX calls to `adminpanelorder_view` trigger stored procedures:
  - `AcceptRefuseOrder(order_id, action, admin_id)` - updates order status
  - `ConfirmPayment(payment_id)` - marks payment as "Paid"
- Email notifications sent on payment or order acceptance (`payment_send_email`, `accept_send_email`)

### Payment Integration
- **Methods:** COD, GCash, Cash (pickup only)
- GCash flow: Customer submits amount + ref_num via POST to `process_gcash_payment()`
- Payment ref stored in `Payment.ref_num`; admin manually confirms in payment panel
- Cascading delete: Payment deletion triggers Order deletion if status not "Pending"/"Completed"/"Processing"

## Development Patterns

### Session Management
- Session expiry set to 0 (browser close) in views: `request.session.set_expiry(0)`
- Order data cached: `request.session['order']`, `request.session['bill']`, `request.session['note']`
- Cleared via `clear_session()` endpoint

### Database Queries
- **ORM:** Standard Django queries for most operations (see `models.py` ForeignKey relationships)
- **Raw SQL/Stored Procedures:** Used for analytics and admin operations
  - Example: `cursor.callproc('CalculateTotalBillForCustomer', [user_id])` in `calculate_total_order_amount()`
  - Called from admin panel for revenue, meal count, customer count
- Connection via: `from django.db import connection; cursor = connection.cursor()`

### AJAX & Forms
- Order submission: JSON POST with CSRF token (@csrf_protect decorator)
- GCash payment: Form data POST (not JSON)
- Cancel order: DELETE-like POST via `cancel_order(order_number)`
- Response format: `JsonResponse({'success': bool, 'message': str})`

### Email Integration
- Configured in settings.py: `huyuhoy.business@gmail.com` with app-specific Gmail password
- Sent via `django.core.mail.send_mail()` in `payment_send_email()`, `accept_send_email()`
- Recipients: customer + admin

### Static Files & Deployment
- CSS in `food/static/food/css/`; JS in `food/static/food/js/`
- Whitenoise middleware for static file serving (settings.py L72)
- Deployed to Heroku; uses `django_heroku.settings(locals())` for auto-config

## Common Tasks

### Adding a New Meal
1. Admin login → Django admin panel (`/admin/`)
2. Add Meal record with name, rice prices, image upload
3. Image stored to `media/meal_images/` (MEDIA_ROOT in settings.py)

### Modifying Order Status Logic
- Edit status assignment in `order()` view (lines ~120-130) based on transaction/payment method
- Update `Order.STATUS_CHOICES` if adding new statuses
- **Note:** Stored procedure `AcceptRefuseOrder` handles admin state transitions

### Debugging Database Issues
- Check `DATABASES` in settings.py for PostgreSQL RDS endpoint (currently hardcoded credentials)
- SQL queries logged to console; enable with `logging.getLogger('django.db.backends')`
- For stored procedures: test in PostgreSQL client, then verify Django call syntax

### Email Testing
- Test locally by changing EMAIL_BACKEND to console backend in settings
- In production, Gmail requires app-specific password (not regular password)
- Current credentials exposed in settings (security issue—use environment variables)

## File Organization

```
huyuhoy/
├── food/                    # Main app
│   ├── models.py           # Meal, Order, Payment, CartItem, CustomUser
│   ├── views.py            # All request handlers (auth, ordering, admin, payment)
│   ├── forms.py            # CustomUserCreationForm
│   ├── urls.py             # Food app routes
│   ├── admin.py            # Django admin customization
│   ├── templates/food/     # HTML templates (base.html, meal.html, order.html, etc.)
│   └── static/food/        # CSS, JS, images
│       ├── css/            # Styling for pages (login, order, etc.)
│       └── js/             # Client-side logic (cart.js, filter.js, order.js)
├── huyuhoy/                # Django project config
│   ├── settings.py         # Configuration, static files, database, email
│   ├── urls.py             # Main URL routing
│   ├── wsgi.py            # WSGI entry for Heroku
└── requirements.txt        # Dependencies (Django 4.2.7, Pillow, django-crispy-forms, etc.)
```

## Important Notes

- **Credentials Exposed:** DB password, email credentials hardcoded in settings.py—migrate to environment variables
- **PaymentModel Cleanup:** Deleting payments triggers cascading order deletion with guard conditions
- **Session-Based Cart:** No persistent cart in DB; relies on client-side + session storage
- **SQL Injection Risk:** Validate admin user_id input before stored procedure calls (some validation exists but strengthen)
- **CSRF Handling:** Most views use @csrf_protect; payment processing uses @csrf_exempt (review security)
