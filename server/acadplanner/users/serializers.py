from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import random
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# =========================================================
# USER SERIALIZER
# Used for:
# - Registration
# - Fetch profile
# =========================================================
class UserSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
            "role",
            "institution_name",
        ]

        extra_kwargs = {
            "password": {"write_only": True},
        }


    # validate passwords only when creating
    def validate(self, attrs):

        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        # only validate if both provided
        if password or confirm_password:

            if not confirm_password:
                raise serializers.ValidationError({
                    "confirm_password": "Confirm password is required."
                })

            if password != confirm_password:
                raise serializers.ValidationError({
                    "confirm_password": "Passwords do not match."
                })

        return attrs


    # create user
    def create(self, validated_data):

        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")

        role = "client"

        first_name = validated_data.get("first_name", "").strip()
        last_name = validated_data.get("last_name", "").strip()

        if first_name and last_name:
            base_name = f"{first_name}_{last_name}"
        else:
            base_name = validated_data["email"].split("@")[0]

        base_username = slugify(base_name)

        if not base_username:
            base_username = f"user_{random.randint(1000,9999)}"

        username = base_username

        # ensure username unique
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


# =========================================================
# INSTITUTION SERIALIZER
# =========================================================
class InstitutionSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "institution_name",
        ]


    def validate_institution_name(self, value):

        if not value:
            raise serializers.ValidationError(
                "Institution name cannot be empty."
            )

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Institution name cannot be blank."
            )

        return value


# =========================================================
# CUSTOM JWT SERIALIZER
# =========================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super().validate(attrs)

        user = self.user

        if user.role == "admin":
            data["redirect_to"] = "/admin/dashboard"

        elif user.role == "teacher":
            data["redirect_to"] = "/teacher/dashboard"

        else:
            data["redirect_to"] = "/client/dashboard"

        return data
