# classes/models.py
from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class SchoolClass(models.Model):
    class_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    class_name = models.CharField(max_length=100)
    stream = models.CharField(max_length=50)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="classes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.class_name} ({self.stream})"
