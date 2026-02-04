from django.contrib import admin
from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        "subject_name",
        "subject_code",
        "created_by",
        "created_at",
    )
    search_fields = (
        "subject_name",
        "subject_code",
    )
    list_filter = (
        "created_by",
    )
    readonly_fields = (
        "subject_id",
        "created_at",
        "updated_at",
    )
