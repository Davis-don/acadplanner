# classes/admin.py
from django.contrib import admin
from .models import SchoolClass

@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = ("class_name", "stream", "created_by", "created_at")
    search_fields = ("class_name", "stream")
    list_filter = ("stream",)
    readonly_fields = ("class_id", "created_at", "updated_at")
