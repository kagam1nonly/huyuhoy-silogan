import random
import os
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Meal, CartItem, Order, Payment

User = get_user_model()


def generate_random_order_number(length=6):
    sample = 'ABCDEFGH0123456789'
    return ''.join(random.choice(sample) for _ in range(length))


class MealSerializer(serializers.ModelSerializer):
    pImage = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = ['meal_id', 'name', 'withUnliRice', 'withoutUnli', 'isHot', 'pImage']

    def get_pImage(self, obj):
        if not obj.pImage:
            return ''

        try:
            relative_url = obj.pImage.url
        except Exception:
            return ''

        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(relative_url)

        backend_origin = os.getenv('BACKEND_ORIGIN', '').strip()
        if backend_origin:
            return f"{backend_origin.rstrip('/')}{relative_url}"

        return relative_url


class AdminMealCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['name', 'withUnliRice', 'withoutUnli', 'isHot', 'pImage']


class AdminMealUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['name', 'withUnliRice', 'withoutUnli', 'isHot', 'pImage']
        extra_kwargs = {
            'name': {'required': False},
            'withUnliRice': {'required': False},
            'withoutUnli': {'required': False},
            'isHot': {'required': False},
            'pImage': {'required': False},
        }


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['cartitem_id', 'name', 'rice', 'price']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'payment_status', 'amount', 'ref_num', 'method']


class OrderSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'number',
            'bill',
            'date',
            'note',
            'status',
            'transaction',
            'address',
            'cart_items',
            'payment',
        ]


class OrderCreateItemSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    rice = serializers.CharField(max_length=60)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderCreateItemSerializer(many=True)
    note = serializers.CharField(required=False, allow_blank=True)
    bill = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction = serializers.ChoiceField(choices=['Delivery', 'Pickup'])
    address = serializers.CharField(required=False, allow_blank=True, max_length=120)
    payment_method = serializers.ChoiceField(choices=['COD', 'GCASH', 'CASH'])

    def create(self, validated_data):
        request = self.context['request']
        items = validated_data.pop('items')

        random_order_number = generate_random_order_number(6)
        while Order.objects.filter(number=random_order_number).exists():
            random_order_number = generate_random_order_number(6)

        transaction_mode = validated_data.get('transaction', 'Pickup')
        payment_method = validated_data.pop('payment_method', 'CASH')

        status = 'Pending'
        if payment_method == 'CASH':
            status = 'Processing'
        if transaction_mode == 'Delivery' and payment_method == 'COD':
            status = 'Processing'

        with transaction.atomic():
            order = Order.objects.create(
                customer=request.user,
                number=random_order_number,
                bill=validated_data['bill'],
                note=validated_data.get('note', ''),
                status=status,
                transaction=transaction_mode,
                address=validated_data.get('address', ''),
            )

            payment = Payment.objects.create(
                order=order,
                payment_status='Unpaid',
                amount=None,
                ref_num='',
                method=payment_method,
            )

            order.payment = payment
            order.save(update_fields=['payment'])

            cart_items = []
            for item in items:
                rice_choice = str(item.get('rice', '')).strip().lower().replace('-', '').replace(' ', '')
                rice = 'with unli-rice' if rice_choice in {'withunlirice', 'withrice'} else 'without unli'
                cart_items.append(
                    CartItem(
                        order=order,
                        name=item['name'],
                        price=item['price'],
                        rice=rice,
                    )
                )

            CartItem.objects.bulk_create(cart_items)

        return order


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'address',
            'is_staff',
            'is_active',
            'date_joined',
        ]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'address']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class AdminOrderActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['Accept', 'Refuse', 'Complete', 'Delete'])


class AdminOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    cart_items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'number',
            'date',
            'status',
            'note',
            'bill',
            'transaction',
            'address',
            'customer_name',
            'payment_status',
            'payment_method',
            'cart_items',
        ]

    def get_customer_name(self, obj):
        full_name = f"{obj.customer.first_name} {obj.customer.last_name}".strip()
        return full_name or obj.customer.username

    def get_payment_status(self, obj):
        if obj.payment:
            return obj.payment.payment_status
        return None

    def get_payment_method(self, obj):
        if obj.payment:
            return obj.payment.method
        return None


class AdminPaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'payment_status',
            'amount',
            'ref_num',
            'method',
            'order_number',
            'customer_name',
        ]

    def get_order_number(self, obj):
        if obj.order:
            return obj.order.number
        return None

    def get_customer_name(self, obj):
        if obj.order and obj.order.customer:
            full_name = f"{obj.order.customer.first_name} {obj.order.customer.last_name}".strip()
            return full_name or obj.order.customer.username
        return None
