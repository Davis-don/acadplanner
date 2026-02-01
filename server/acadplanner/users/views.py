from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

@api_view(['POST'])
def New_user(request):
    """
    Create a new CustomUser from POSTed JSON.
    Validates that password and confirm_password match.
    Returns created user data if successful.
    """
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        # Save the user
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            }
        }, status=status.HTTP_201_CREATED)
    else:
        # If validation fails (including password mismatch), return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
