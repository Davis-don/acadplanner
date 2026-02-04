from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Subject(models.Model):
    subject_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    subject_name = models.CharField(
        max_length=100
    )
    subject_code = models.CharField(
        max_length=20
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subjects"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["subject_name"]
        unique_together = ("subject_code", "created_by")

    def __str__(self):
        return f"{self.subject_name} ({self.subject_code})"
