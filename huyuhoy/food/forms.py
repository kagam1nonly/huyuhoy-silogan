from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Customer

class CustomUserCreationForm(UserCreationForm):
    address = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your address'}))
    phone = forms.CharField(max_length=15, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your phone number'}))
    
    class Meta:
        model = User
        fields =  ['first_name', 'last_name', 'email', 'phone', 'username', 'password1', 'password2', 'address']

    def __init__(self, *args, **kwargs):
        super(CustomUserCreationForm, self).__init__(*args, **kwargs)
        # Add placeholders and styles for fields in UserCreationForm
        self.fields['first_name'].widget.attrs['placeholder'] = 'Enter your first name'
        self.fields['last_name'].widget.attrs['placeholder'] = 'Enter your last name'
        self.fields['email'].widget.attrs['placeholder'] = 'Enter your email'
        self.fields['username'].widget.attrs['placeholder'] = 'Choose a username'
        self.fields['password1'].widget.attrs['placeholder'] = 'Enter your password'
        self.fields['password2'].widget.attrs['placeholder'] = 'Confirm your password'
        # Add custom styles if needed
        self.fields['first_name'].widget.attrs['class'] = 'first-class'
        self.fields['last_name'].widget.attrs['class'] = 'last-class'
        self.fields['email'].widget.attrs['class'] = 'email-class'
        self.fields['username'].widget.attrs['class'] = 'user-class'
        self.fields['password1'].widget.attrs['class'] = 'pass1-class'
        self.fields['password2'].widget.attrs['class'] = 'pass2-class'
