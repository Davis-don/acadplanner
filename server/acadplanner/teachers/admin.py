from django.contrib import admin
from .models import Teacher


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):

    # Columns shown in admin list page
    list_display = (
        "teacher_name",
        "teacher_code",
        "allocated",      # ✅ added
        "created_by",
        "created_at",
    )

    # Search capability
    search_fields = (
        "teacher_name",
        "teacher_code",
    )

    # Filters on right side
    list_filter = (
        "allocated",      # ✅ added
        "created_by",
        "created_at",     # optional but useful
    )

    # Read-only fields in form
    readonly_fields = (
        "teacher_id",
        "created_at",
        "updated_at",
    )

    # Default ordering (smallest → largest teacher_code)
    ordering = (
        "teacher_code",
    )

    # Optional: make admin cleaner
    fieldsets = (
        ("Teacher Information", {
            "fields": (
                "teacher_name",
                "teacher_code",
                "allocated",   # ✅ added
                "created_by",
            )
        }),
        ("System Information", {
            "fields": (
                "teacher_id",
                "created_at",
                "updated_at",
            )
        }),
    )
