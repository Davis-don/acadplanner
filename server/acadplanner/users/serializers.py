from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import random

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'password',
            'confirm_password',
            'role',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False},  # Changed to False to make it optional
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Remove role from validated_data if it exists (we'll handle it separately)
        role = validated_data.pop('role', None)
        
        # Generate internal username (not used for login)
        first_name = validated_data.get('first_name', '').strip()
        last_name = validated_data.get('last_name', '').strip()
        
        if not first_name or not last_name:
            # Fallback: use email without domain
            base_name = validated_data['email'].split('@')[0]
        else:
            base_name = f"{first_name}_{last_name}"
        
        base_username = slugify(base_name)
        
        # Ensure base_username is not empty
        if not base_username:
            base_username = f"user_{validated_data['email'].split('@')[0]}"
        
        username = base_username
        counter = 0
        
        # Ensure unique username
        while User.objects.filter(username=username).exists():
            if counter < 10:
                username = f"{base_username}_{random.randint(100,999)}"
            else:
                # Use more unique identifier
                username = f"{base_username}_{random.randint(100000,999999)}"
            counter += 1
        
        # Create user without role first
        user = User(username=username, **validated_data)
        
        # Set role if provided, otherwise use default from model
        if role:
            user.role = role
        # If role not provided, the model's default ('client') will be used automatically
        
        user.set_password(password)
        user.save()
        return user