from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    address = forms.CharField(max_length=255, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your address'}))
    phone = forms.CharField(max_length=11, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your phone number'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your email'}))
    first_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your first name'}))
    last_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'custom-class', 'placeholder': 'Enter your last name'}))


    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'username', 'password1', 'password2', 'address']

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

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise forms.ValidationError('This field is required.')
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not phone:
            raise forms.ValidationError('This field is required.')
        return phone

    def clean_address(self):
        address = self.cleaned_data.get('address')
        if not address:
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
    