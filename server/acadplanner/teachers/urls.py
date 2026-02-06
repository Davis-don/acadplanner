from django.urls import path
from .views import add_teacher, get_user_teachers, update_teacher, delete_teacher

urlpatterns = [
    path('new_teacher/', add_teacher, name='add_teacher'),          # POST
    path('my_teachers/', get_user_teachers, name='get_user_teachers'),  # GET
    path('<uuid:teacher_id>/', update_teacher, name='update_teacher'),  # PATCH/PUT
    path('<uuid:teacher_id>/delete/', delete_teacher, name='delete_teacher'),  # DELETE
]
