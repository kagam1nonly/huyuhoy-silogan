from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Meal, Order, Payment
from .serializers import (
    MealSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    UserSerializer,
    SignupSerializer,
    LoginSerializer,
    AdminOrderActionSerializer,
    AdminOrderSerializer,
    AdminPaymentSerializer,
)


def health_check_view(request):
    return JsonResponse({'status': 'ok'})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class SignupAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully.'})


class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AdminOrdersAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders = Order.objects.select_related('customer', 'payment').prefetch_related('cart_items').order_by('-date')
        return Response(AdminOrderSerializer(orders, many=True).data)


class AdminOrderActionAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        serializer = AdminOrderActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        if action == 'Accept':
            if order.status != 'Pending':
                return Response({'detail': 'Only Pending orders can be accepted.'}, status=status.HTTP_400_BAD_REQUEST)
            order.status = 'Processing'
            order.save(update_fields=['status'])
            return Response({'detail': 'Order accepted successfully.'})

        if action == 'Refuse':
            if order.status not in ['Pending', 'Processing']:
                return Response({'detail': 'Only Pending or Processing orders can be refused.'}, status=status.HTTP_400_BAD_REQUEST)
            order.status = 'Canceled'
            order.save(update_fields=['status'])
            return Response({'detail': 'Order refused successfully.'})

        if action == 'Complete':
            if order.status != 'Processing':
                return Response({'detail': 'Only Processing orders can be completed.'}, status=status.HTTP_400_BAD_REQUEST)
            order.status = 'Completed'
            order.save(update_fields=['status'])
            return Response({'detail': 'Order completed successfully.'})

        if action == 'Delete':
            if order.status != 'Canceled':
                return Response({'detail': 'Only Canceled orders can be deleted.'}, status=status.HTTP_400_BAD_REQUEST)
            order.delete()
            return Response({'detail': 'Order deleted successfully.'})

        return Response({'detail': 'Unsupported action.'}, status=status.HTTP_400_BAD_REQUEST)


class AdminPaymentsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        payments = Payment.objects.select_related('order', 'order__customer').order_by('-id')
        return Response(AdminPaymentSerializer(payments, many=True).data)


class AdminPaymentConfirmAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id)
        payment.payment_status = 'Paid'
        payment.save(update_fields=['payment_status'])
        return Response({'detail': 'Payment confirmed successfully.'})


class AdminPaymentDeleteAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id)
        payment.delete()
        return Response({'detail': 'Payment deleted successfully.'})


class MealListAPIView(generics.ListAPIView):
    queryset = Meal.objects.all().order_by('meal_id')
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]


class OrderListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user).order_by('-date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'number'

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)


class CancelOrderAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(Order, number=order_number, customer=request.user)

        if order.status != 'Canceled':
            return Response(
                {'success': False, 'message': 'Order can only be deleted when status is Canceled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.delete()
        return Response({'success': True, 'message': 'Order canceled successfully.'})


class GCashPaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        amount = request.data.get('amount')
        ref_num = request.data.get('ref_num')

        if not amount or not ref_num:
            return Response(
                {'success': False, 'message': 'Both amount and ref_num are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(Order, number=order_number, customer=request.user)
        payment = Payment.objects.filter(order=order).first()

        if payment is None:
            payment = Payment.objects.create(order=order)

        payment.payment_status = 'Pending'
        payment.amount = amount
        payment.ref_num = ref_num
        payment.method = 'GCASH'
        payment.save()

        order.payment = payment
        order.save(update_fields=['payment'])

        return Response({'success': True, 'message': 'Payment processed successfully.'})
