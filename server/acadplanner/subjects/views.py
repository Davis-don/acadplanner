from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import uuid

from .models import Subject
from .serializers import SubjectSerializer
from users.authentication import CookieJWTAuthentication

@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def add_subject(request):
    """
    Create a new Subject for the logged-in user.
    """
    serializer = SubjectSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        subject = serializer.save()
        return Response(
            {
                "message": "Subject added successfully",
                "subject": SubjectSerializer(subject).data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_subjects(request):
    """
    Get all Subject objects created by the currently logged-in user.
    """
    user = request.user
    subjects = Subject.objects.filter(created_by=user).order_by('-created_at')
    serializer = SubjectSerializer(subjects, many=True)

    return Response(
        {
            "message": "Subjects retrieved successfully",
            "subjects": serializer.data,
            "count": len(serializer.data)
        },
        status=status.HTTP_200_OK
    )

@api_view(['PATCH', 'PUT'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_subject(request, subject_id):
    """
    Update one, some, or all fields of a Subject.
    Supports PATCH (partial) and PUT (full).
    """
    user = request.user

    try:
        # Convert string to UUID if needed
        if isinstance(subject_id, str):
            subject_id = uuid.UUID(subject_id)

        subject = Subject.objects.get(
            subject_id=subject_id,
            created_by=user
        )
    except (Subject.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Subject not found or you do not have permission to edit it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = SubjectSerializer(
        subject,
        data=request.data,
        partial=True,  # allows editing one or more fields
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Subject updated successfully",
                "subject": serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_subject(request, subject_id):
    """
    Delete a Subject by ID for the logged-in user.
    """
    user = request.user

    try:
        # Convert string to UUID if needed
        if isinstance(subject_id, str):
            subject_id = uuid.UUID(subject_id)

        subject = Subject.objects.get(
            subject_id=subject_id,
            created_by=user
        )
    except (Subject.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Subject not found or you do not have permission to delete it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    subject.delete()

    return Response(
        {
            "message": "Subject deleted successfully"
        },
        status=status.HTTP_200_OK
    )

