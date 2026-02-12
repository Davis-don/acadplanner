# timetables/admin.py

from django.contrib import admin
from .models import TimetableTemplate, TimetableBreak


# Inline breaks inside template
class TimetableBreakInline(admin.TabularInline):
    model = TimetableBreak
    extra = 1


@admin.register(TimetableTemplate)
class TimetableTemplateAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "created_by",
        "lessons_per_day",
        "lesson_duration_minutes",
        "day_start_time",
        "created_at",
    )

    # ✅ FIXED: remove monday_active, etc.
    list_filter = (
        "created_by",
        "created_at",
    )

    search_fields = (
        "name",
        "created_by__email",
    )

    readonly_fields = (
        "template_id",
        "created_at",
        "updated_at",
    )

    inlines = [TimetableBreakInline]


@admin.register(TimetableBreak)
class TimetableBreakAdmin(admin.ModelAdmin):

    list_display = (
        "break_name",
        "template",
        "duration_minutes",
        "position",
    )

    list_filter = (
        "template",
    )

    search_fields = (
        "break_name",
    )
