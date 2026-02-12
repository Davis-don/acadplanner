# timetables/serializers.py

from rest_framework import serializers
from .models import TimetableTemplate, TimetableBreak


VALID_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]


# ============================================================
# BREAK SERIALIZER
# ============================================================
class TimetableBreakSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimetableBreak
        fields = [
            "break_name",
            "duration_minutes",
            "position",
        ]


# ============================================================
# TEMPLATE SERIALIZER
# ============================================================
class TimetableTemplateSerializer(serializers.ModelSerializer):

    breaks = TimetableBreakSerializer(many=True, required=False)

    class Meta:
        model = TimetableTemplate
        fields = [
            "template_id",
            "name",
            "description",
            "day_start_time",
            "lesson_duration_minutes",
            "lessons_per_day",
            "active_days",
            "breaks",
            "created_at",
        ]

        read_only_fields = [
            "template_id",
            "created_at",
        ]

    # ✅ Validate active days
    def validate_active_days(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "active_days must be a list"
            )

        for day in value:
            if day.lower() not in VALID_DAYS:
                raise serializers.ValidationError(
                    f"{day} is not a valid day"
                )

        return value

    # ✅ Validate break positions safely (supports partial update)
    def validate(self, data):

        lessons_per_day = data.get(
            "lessons_per_day",
            self.instance.lessons_per_day if self.instance else None
        )

        breaks = self.initial_data.get("breaks", None)

        if breaks and lessons_per_day:
            for b in breaks:
                if b["position"] > lessons_per_day:
                    raise serializers.ValidationError(
                        f"Break position {b['position']} exceeds lessons_per_day"
                    )

        return data

    # ✅ CREATE
    def create(self, validated_data):

        breaks_data = validated_data.pop("breaks", [])
        user = self.context["request"].user

        template = TimetableTemplate.objects.create(
            created_by=user,
            **validated_data
        )

        for break_data in breaks_data:
            TimetableBreak.objects.create(
                template=template,
                **break_data
            )

        return template

    # ✅ UPDATE (supports partial update)
    def update(self, instance, validated_data):

        breaks_data = validated_data.pop("breaks", None)

        # Update template fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # If breaks provided → replace existing breaks
        if breaks_data is not None:
            instance.breaks.all().delete()

            for break_data in breaks_data:
                TimetableBreak.objects.create(
                    template=instance,
                    **break_data
                )

        return instance
