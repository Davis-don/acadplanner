from django.urls import path
from .views import (
    add_subject,
    get_user_subjects,
    delete_subject,
    update_subject,
)

urlpatterns = [
    path('new_subject/', add_subject, name='add_subject'),
    path('my_subjects/', get_user_subjects, name='get_user_subjects'),
    path('delete_subject/<str:subject_id>/', delete_subject, name='delete_subject'),
    path('update-subject/<uuid:subject_id>/', update_subject, name='update_subject'),
]
