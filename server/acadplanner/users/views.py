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

from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
    InstitutionSerializer,
    UpdatePasswordSerializer  # ADD THIS IMPORT
)

from .authentication import CookieJWTAuthentication


# ============================
# SIGNUP VIEW
# ============================
@api_view(['POST'])
def New_user(request):

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
                    "institution_name": user.institution_name,
                },
                "next": "LOGIN_REQUIRED",
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# LOGIN VIEW
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

        # access cookie
        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 7,  # 7 days
        )

        # refresh cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=60 * 60 * 24 * 30,  # 30 days
        )

        return response


# ============================
# AUTH CHECK VIEW
# ============================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_auth(request):

    user = request.user

    return Response(
        {
            "is_authenticated": True,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "institution_name": user.institution_name,
        },
        status=status.HTTP_200_OK,
    )


# ============================
# UPDATE USER PROFILE VIEW
# ============================
@api_view(['PATCH'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile (email, first_name, last_name)
    """
    user = request.user
    
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        
        return Response(
            {
                "message": "Profile updated successfully",
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# UPDATE PASSWORD VIEW
# ============================
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_password(request):
    """
    Update user password
    """
    serializer = UpdatePasswordSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        
        return Response(
            {
                "message": "Password updated successfully"
            },
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# UPDATE INSTITUTION VIEW
# ============================
@api_view(['PATCH', 'PUT'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_or_create_institution(request):
    """
    Adds institution_name if empty
    Updates institution_name if already exists
    Works for both PATCH and PUT
    """

    user = request.user

    institution_name = request.data.get("institution_name")

    if not institution_name:
        return Response(
            {
                "error": "institution_name is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    institution_name = institution_name.strip()

    if not institution_name:
        return Response(
            {
                "error": "institution_name cannot be empty"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # check if creating or updating
    is_new = not bool(user.institution_name)

    user.institution_name = institution_name
    user.save()

    return Response(
        {
            "message": (
                "Institution added successfully"
                if is_new
                else "Institution updated successfully"
            ),
            "institution_name": user.institution_name,
        },
        status=status.HTTP_200_OK
    )


# ============================
# LOGOUT VIEW
# ============================
@api_view(['POST'])
def logout_user(request):

    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:

        try:

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


# ============================
# FETCH USER PROFILE VIEW
# ============================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def fetch_user_profile(request):
    """
    Fetch full authenticated user profile using cookie authentication
    Only works if user is logged in
    """

    user = request.user

    serializer = UserSerializer(user)

    return Response(
        {
            "message": "User profile fetched successfully",
            "user": serializer.data,
        },
        status=status.HTTP_200_OK,
    )