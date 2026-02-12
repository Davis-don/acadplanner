from rest_framework import serializers
from .models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            "teacher_id",
            "teacher_name",
            "teacher_code",
            "allocated",  # ✅ added here
            "created_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "teacher_id",
            "created_by",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):
        # Automatically assign logged-in user as creator
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)
