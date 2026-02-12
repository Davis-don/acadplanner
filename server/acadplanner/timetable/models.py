from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


# ============================================================
# TIMETABLE TEMPLATE
# Stores full timetable structure (no lessons allocated)
# ============================================================
class TimetableTemplate(models.Model):

    template_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    # Start time of school day
    day_start_time = models.TimeField()

    # Duration of one lesson
    lesson_duration_minutes = models.PositiveIntegerField()

    # Number of lessons per day
    lessons_per_day = models.PositiveIntegerField()

    # Active days stored as list
    # Example: ["monday", "tuesday", "wednesday"]
    active_days = models.JSONField(
        default=list,
        help_text="List of active days"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="timetable_templates"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("name", "created_by")

    def __str__(self):
        return f"{self.name} - {self.created_by.email}"


# ============================================================
# BREAK MODEL
# Stores break positions inside template
# ============================================================
class TimetableBreak(models.Model):

    break_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    template = models.ForeignKey(
        TimetableTemplate,
        on_delete=models.CASCADE,
        related_name="breaks"
    )

    break_name = models.CharField(
        max_length=100
    )

    duration_minutes = models.PositiveIntegerField()

    # Break occurs AFTER lesson number
    position = models.PositiveIntegerField()

    class Meta:
        ordering = ["position"]
        unique_together = ("template", "position")

    def __str__(self):
        return f"{self.break_name} (After lesson {self.position})"
