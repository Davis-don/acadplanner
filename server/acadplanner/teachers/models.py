from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Teacher(models.Model):
    teacher_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    teacher_name = models.CharField(
        max_length=100
    )
    teacher_code = models.CharField(
        max_length=20
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="teachers"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["teacher_name"]
        unique_together = ("teacher_code", "created_by")

    def __str__(self):
        return f"{self.teacher_name} ({self.teacher_code})"
