from django.urls import path
from .views import add_school_class, get_user_classes, delete_school_class,update_school_class

urlpatterns = [
    path('new_class/', add_school_class, name='add_school_class'),
    path('my_classes/', get_user_classes, name='get_user_classes'),
    path('delete_class/<str:class_id>/', delete_school_class, name='delete_school_class'),
    path('update-class/<uuid:class_id>/', update_school_class, name='update-school-class'),
]