from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("teacher_name", "teacher_code", "created_by", "created_at")
    search_fields = ("teacher_name", "teacher_code")
    list_filter = ("created_by",)
    readonly_fields = ("teacher_id", "created_at", "updated_at")
