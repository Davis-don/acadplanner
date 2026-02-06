from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):

    # Fields when editing existing user
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (
                'role',
                'institution_name',
            ),
        }),
    )

    # Fields when creating new user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': (
                'role',
                'institution_name',
            ),
        }),
    )

    # Show in admin list view
    list_display = (
        'email',
        'first_name',
        'last_name',
        'role',
        'institution_name',
        'is_staff',
        'is_active',
    )

    # Allow search
    search_fields = (
        'email',
        'first_name',
        'last_name',
        'institution_name',
    )

    # Ordering
    ordering = ('email',)
