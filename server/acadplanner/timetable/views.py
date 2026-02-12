# timetables/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import TimetableTemplate
from .serializers import TimetableTemplateSerializer


# ============================================================
# CREATE TEMPLATE
# ============================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_timetable_template(request):

    user = request.user

    if TimetableTemplate.objects.filter(created_by=user).exists():
        return Response(
            {
                "error": "You already have a timetable template. Please edit your existing template."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = TimetableTemplateSerializer(
        data=request.data,
        context={"request": request}
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Timetable template created successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# UPDATE TEMPLATE
# ============================================================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_timetable_template(request):

    user = request.user

    try:
        template = TimetableTemplate.objects.get(created_by=user)
    except TimetableTemplate.DoesNotExist:
        return Response(
            {"error": "No timetable template found to update."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TimetableTemplateSerializer(
        template,
        data=request.data,
        partial=True,
        context={"request": request}
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Timetable template updated successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# FETCH USER TEMPLATE
# ============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_timetable_template(request):

    user = request.user

    try:
        template = TimetableTemplate.objects.get(created_by=user)

        serializer = TimetableTemplateSerializer(template)

        return Response(
            {
                "message": "Template fetched successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    except TimetableTemplate.DoesNotExist:

        return Response(
            {
                "message": "No timetable template found",
                "data": None
            },
            status=status.HTTP_200_OK
        )
