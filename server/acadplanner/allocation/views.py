from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import uuid

from .models import TeacherSubjectClassAllocation
from .serializers import TeacherSubjectClassAllocationSerializer

from users.authentication import CookieJWTAuthentication


# =========================================
# ADD ALLOCATION
# =========================================
@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def add_allocation(request):

    serializer = TeacherSubjectClassAllocationSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():

        school_class = serializer.validated_data['school_class']
        subject = serializer.validated_data['subject']

        # Check if the class + subject already has a teacher
        duplicate_exists = TeacherSubjectClassAllocation.objects.filter(
            school_class=school_class,
            subject=subject
        ).exists()

        if duplicate_exists:
            return Response(
                {
                    "error": "This subject is already allocated to a teacher in this class"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # If no duplicate, save allocation
        allocation = serializer.save()

        return Response(
            {
                "message": "Allocation created successfully",
                "allocation": TeacherSubjectClassAllocationSerializer(allocation, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# =========================================
# GET ALL ALLOCATIONS
# =========================================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_allocations(request):

    allocations = TeacherSubjectClassAllocation.objects.filter(
        created_by=request.user
    ).select_related(
        "teacher",
        "subject",
        "school_class"
    )

    serializer = TeacherSubjectClassAllocationSerializer(
        allocations,
        many=True
    )

    return Response(
        {
            "message": "Allocations fetched successfully",
            "allocations": serializer.data,
            "count": len(serializer.data)
        },
        status=status.HTTP_200_OK
    )


# =========================================
# GET SINGLE ALLOCATION
# =========================================
@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_single_allocation(request, allocation_id):

    try:
        allocation_id = uuid.UUID(allocation_id)

        allocation = TeacherSubjectClassAllocation.objects.get(
            allocation_id=allocation_id,
            created_by=request.user
        )

    except:
        return Response(
            {"error": "Allocation not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TeacherSubjectClassAllocationSerializer(allocation)

    return Response(serializer.data)


# =========================================
# UPDATE ALLOCATION
# =========================================
@api_view(['PATCH', 'PUT'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_allocation(request, allocation_id):

    try:
        # DO NOT convert allocation_id, Django already gives UUID
        allocation = TeacherSubjectClassAllocation.objects.get(
            allocation_id=allocation_id,
            created_by=request.user
        )

    except TeacherSubjectClassAllocation.DoesNotExist:
        return Response(
            {"error": "Allocation not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TeacherSubjectClassAllocationSerializer(
        allocation,
        data=request.data,
        partial=True,
        context={'request': request}
    )

    if serializer.is_valid():

        # Prevent duplicate allocation
        school_class = serializer.validated_data.get(
            'school_class', allocation.school_class
        )
        subject = serializer.validated_data.get(
            'subject', allocation.subject
        )

        duplicate_exists = TeacherSubjectClassAllocation.objects.filter(
            school_class=school_class,
            subject=subject
        ).exclude(allocation_id=allocation.allocation_id).exists()

        if duplicate_exists:
            return Response(
                {
                    "error": "This subject is already allocated to another teacher in this class"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()

        return Response(
            {
                "message": "Allocation updated successfully",
                "allocation": serializer.data
            },
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========================================
# DELETE ALLOCATION
# =========================================
@api_view(['DELETE'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_allocation(request, allocation_id):

    try:
        allocation = TeacherSubjectClassAllocation.objects.get(
            allocation_id=allocation_id  # already UUID
        )

        allocation.delete()

        return Response(
            {"message": "Allocation deleted successfully"},
            status=status.HTTP_200_OK
        )

    except TeacherSubjectClassAllocation.DoesNotExist:
        return Response(
            {"error": "Allocation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
