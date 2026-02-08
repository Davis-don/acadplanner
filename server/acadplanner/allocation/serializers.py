from rest_framework import serializers
from .models import TeacherSubjectClassAllocation


class TeacherSubjectClassAllocationSerializer(serializers.ModelSerializer):

    teacher_name = serializers.CharField(
        source="teacher.teacher_name",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.subject_name",
        read_only=True
    )

    class_name = serializers.CharField(
        source="school_class.class_name",
        read_only=True
    )

    stream = serializers.CharField(
        source="school_class.stream",
        read_only=True
    )

    class Meta:
        model = TeacherSubjectClassAllocation

        fields = [
            "allocation_id",

            "teacher",
            "teacher_name",

            "subject",
            "subject_name",

            "school_class",
            "class_name",
            "stream",

            "number_of_lessons",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "allocation_id",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
