from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    address = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your address'}))
    phone = forms.CharField(max_length=11, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your phone number'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your email'}))
    first_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your first name'}))
    last_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your last name'}))

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone', 'username', 'password1', 'password2', 'address']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            print("Email field is required.")
            raise forms.ValidationError('This field is required.')
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not phone:
            print("Phone field is required.")
            raise forms.ValidationError('This field is required.')
        return phone

    def clean_address(self):
        address = self.cleaned_data.get('address')
        if not address:
            print("Address field is required.")
            raise forms.ValidationError('This field is required.')
        return address
    
    def clean_first_name(self):
        first_name = self.cleaned_data.get('first_name')
        if any(char.isdigit() for char in first_name):
            raise forms.ValidationError('First name should not contain digits.')
        return first_name

    def clean_last_name(self):
        last_name = self.cleaned_data.get('last_name')
        if any(char.isdigit() for char in last_name):
            raise forms.ValidationError('Last name should not contain digits.')
        return last_name
    