from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import random
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # 🔐 ROLE DECIDED SERVER-SIDE ONLY
        role = 'CLIENT'   # change default if needed

        first_name = validated_data.get('first_name', '').strip()
        last_name = validated_data.get('last_name', '').strip()

        if first_name and last_name:
            base_name = f"{first_name}_{last_name}"
        else:
            base_name = validated_data['email'].split('@')[0]

        base_username = slugify(base_name)
        if not base_username:
            base_username = f"user_{random.randint(1000,9999)}"

        username = base_username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{random.randint(100,999)}"

        user = User(
            username=username,
            role=role,
            **validated_data
        )
        user.set_password(password)
        user.save()

        return user


# 🔐 CUSTOM JWT SERIALIZER (LOGIN)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        # SERVER decides redirect
        if user.role == 'ADMIN':
            data['redirect_to'] = '/admin/dashboard'
        elif user.role == 'TEACHER':
            data['redirect_to'] = '/teacher/dashboard'
        else:
            data['redirect_to'] = '/client/dashboard'

        return data
