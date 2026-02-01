# users/views.py
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from .authentication import CookieJWTAuthentication


# ============================
# ✅ SIGNUP VIEW
# ============================
@api_view(['POST'])
def New_user(request):
    """
    Create a new user from POSTed JSON.
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "next": "LOGIN_REQUIRED",
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# ✅ CUSTOM LOGIN VIEW (JWT)
# Sets HttpOnly cookies
# ============================
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        data = serializer.validated_data
        access = data.pop("access")
        refresh = data.pop("refresh")
        redirect_to = data.pop("redirect_to", "/")

        response = Response(
            {
                "message": "Login successful",
                "redirect_to": redirect_to,
            },
            status=status.HTTP_200_OK,
        )

        # ✅ Access token cookie
        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=False,      # 🔒 set True in production (HTTPS)
            samesite="Lax",
            path="/",
            max_age=60 * 15,   # 15 minutes
        )

        # ✅ Refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24,  # 1 day
        )

        return response


# ============================
# ✅ AUTH CHECK VIEW
# ============================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """
    Used by frontend to check login state.
    """
    user = request.user
    return Response(
        {
            "is_authenticated": True,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": getattr(user, "role", None),
        },
        status=status.HTTP_200_OK,
    )


# ============================
# ✅ LOGOUT VIEW (PROPER)
# Clears cookies + blacklists refresh token
# ============================
@api_view(['POST'])
def logout_user(request):
    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    response = Response(
        {"message": "Logged out successfully"},
        status=status.HTTP_200_OK,
    )

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return response

