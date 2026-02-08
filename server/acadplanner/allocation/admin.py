from django.contrib import admin
from .models import TeacherSubjectClassAllocation


@admin.register(TeacherSubjectClassAllocation)
class TeacherSubjectClassAllocationAdmin(admin.ModelAdmin):

    # columns to display in admin list view
    list_display = (
        "allocation_id",
        "teacher",
        "subject",
        "school_class",
        "number_of_lessons",
        "created_by",
        "created_at",
    )

    # enable filtering
    list_filter = (
        "created_by",
        "subject",
        "school_class",
        "teacher",
        "created_at",
    )

    # enable searching
    search_fields = (
        "teacher__teacher_name",
        "subject__subject_name",
        "school_class__class_name",
        "school_class__stream",
        "created_by__email",
    )

    # readonly fields
    readonly_fields = (
        "allocation_id",
        "created_at",
        "updated_at",
    )

    # ordering
    ordering = ("-created_at",)

    # better dropdown performance
    autocomplete_fields = (
        "teacher",
        "subject",
        "school_class",
        "created_by",
    )

    # pagination
    list_per_page = 25
