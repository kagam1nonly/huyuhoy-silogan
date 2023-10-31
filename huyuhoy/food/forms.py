from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    address = forms.CharField(max_length=255, required=True)
    phone = forms.CharField(max_length=15, required=True)
    class Meta:
        model = User
        fields =  ['first_name', 'last_name', 'email', 'phone', 'username', 'password1', 'password2', 'address']

# first_name = forms.CharField(max_length=30, required=True)
#     last_name = forms.CharField(max_length=30, required=True)
#     email = forms.EmailField(max_length=254, required=True)
#     password1 = forms.CharField(min_length= 8, max_length=16, required=True)
#     password2 = forms.CharField(min_length= 8, max_length=16, required=True)