from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_TYPE = (
        ('admin', 'Admin'),
        ('client', 'Client'),
        ('agent', 'Agent'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_TYPE,
        default='client'
    )

    # Make email required and unique
    email = models.EmailField(unique=True)

    # Optional institution name field
    institution_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    USERNAME_FIELD = 'email'   # Use email to login
    REQUIRED_FIELDS = ['first_name', 'last_name']  # username is optional

    def __str__(self):
        return self.email
