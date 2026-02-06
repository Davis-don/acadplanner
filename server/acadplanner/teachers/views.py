from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import uuid

from .models import Teacher
from .serializers import TeacherSerializer
from users.authentication import CookieJWTAuthentication


# ============================
# ✅ ADD TEACHER
# ============================
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def add_teacher(request):
    """
    Create a new Teacher for the logged-in user.
    """
    serializer = TeacherSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        teacher = serializer.save()
        return Response(
            {
                "message": "Teacher added successfully",
                "teacher": TeacherSerializer(teacher).data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# ✅ GET ALL TEACHERS FOR LOGGED-IN USER
# ============================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_teachers(request):
    """
    Get all Teacher objects created by the currently logged-in user.
    """
    user = request.user
    teachers = Teacher.objects.filter(created_by=user).order_by('-created_at')
    serializer = TeacherSerializer(teachers, many=True)

    return Response(
        {
            "message": "Teachers retrieved successfully",
            "teachers": serializer.data,
            "count": len(serializer.data)
        },
        status=status.HTTP_200_OK
    )


# ============================
# ✅ UPDATE TEACHER (PARTIAL / FULL)
# ============================
@api_view(['PATCH', 'PUT'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_teacher(request, teacher_id):
    """
    Update one, some, or all fields of a Teacher.
    Supports PATCH (partial) and PUT (full).
    """
    user = request.user

    try:
        if isinstance(teacher_id, str):
            teacher_id = uuid.UUID(teacher_id)

        teacher = Teacher.objects.get(
            teacher_id=teacher_id,
            created_by=user
        )
    except (Teacher.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Teacher not found or you do not have permission to edit it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TeacherSerializer(
        teacher,
        data=request.data,
        partial=True,  # allows editing one or more fields
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Teacher updated successfully",
                "teacher": serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# ✅ DELETE TEACHER
# ============================
@api_view(['DELETE'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_teacher(request, teacher_id):
    """
    Delete a Teacher by ID for the logged-in user.
    """
    user = request.user

    try:
        if isinstance(teacher_id, str):
            teacher_id = uuid.UUID(teacher_id)

        teacher = Teacher.objects.get(
            teacher_id=teacher_id,
            created_by=user
        )
    except (Teacher.DoesNotExist, ValueError):
        return Response(
            {
                "error": "Teacher not found or you do not have permission to delete it"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    teacher.delete()

    return Response(
        {
            "message": "Teacher deleted successfully"
        },
        status=status.HTTP_200_OK
    )
