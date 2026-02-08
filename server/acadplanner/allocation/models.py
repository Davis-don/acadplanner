from django.db import models
from django.contrib.auth import get_user_model
import uuid

from teachers.models import Teacher
from subjects.models import Subject
from classes.models import SchoolClass

User = get_user_model()


class TeacherSubjectClassAllocation(models.Model):
    allocation_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="allocations"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="allocations"
    )

    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name="allocations"
    )

    number_of_lessons = models.PositiveIntegerField()

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="allocations"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = (
            "teacher",
            "subject",
            "school_class",
            "created_by"
        )

    def __str__(self):
        return f"{self.teacher} → {self.subject} → {self.school_class}"
