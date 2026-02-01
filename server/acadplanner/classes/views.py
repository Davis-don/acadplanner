from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import uuid

from .serializers import SchoolClassSerializer
from .models import SchoolClass
from users.authentication import CookieJWTAuthentication


# ============================
# ✅ ADD SCHOOL CLASS
# ============================
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def add_school_class(request):
    """
    Create a new class (SchoolClass) for the logged-in user.
    """
    serializer = SchoolClassSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        school_class = serializer.save()
        return Response(
            {
                "message": "Class added successfully",
                "class": SchoolClassSerializer(school_class).data
            },
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# ✅ FETCH ALL CLASSES FOR LOGGED-IN USER
# ============================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_classes(request):
    """
    Get all SchoolClass objects linked to the currently logged-in user.
    """
    user = request.user
    classes = SchoolClass.objects.filter(created_by=user).order_by('-created_at')
    serializer = SchoolClassSerializer(classes, many=True)
    
    return Response(
        {
            "message": "Classes retrieved successfully",
            "classes": serializer.data,
            "count": len(serializer.data)
        },
        status=status.HTTP_200_OK
    )


# ============================
# ✅ DELETE SCHOOL CLASS BY ID
# ============================
@api_view(['DELETE'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_school_class(request, class_id):
    """
    Delete a SchoolClass by ID for the logged-in user.
    """
    user = request.user

    try:
        # Convert string to UUID if needed
        if isinstance(class_id, str):
            class_id = uuid.UUID(class_id)
            
        school_class = SchoolClass.objects.get(class_id=class_id, created_by=user)
    except (SchoolClass.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Class not found or you do not have permission to delete it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    school_class.delete()

    return Response(
        {
            "message": "Class deleted successfully"
        },
        status=status.HTTP_200_OK  # Changed from 204 to 200 for proper JSON response
    )


# ============================
# ✅ UPDATE SCHOOL CLASS (PARTIAL / FULL)
# ============================
@api_view(['PATCH', 'PUT'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_school_class(request, class_id):
    """
    Update one, some, or all fields of a SchoolClass.
    Supports PATCH (partial) and PUT (full).
    """
    user = request.user

    try:
        # Convert string to UUID if needed
        if isinstance(class_id, str):
            class_id = uuid.UUID(class_id)
            
        school_class = SchoolClass.objects.get(class_id=class_id, created_by=user)
    except (SchoolClass.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Class not found or you do not have permission to edit it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = SchoolClassSerializer(
        school_class,
        data=request.data,
        partial=True,  # allows editing 1 or more fields
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Class updated successfully",
                "class": serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)