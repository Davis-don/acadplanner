from django.urls import path
from .views import (
    create_timetable_template,
    update_timetable_template,
    get_timetable_template
)

urlpatterns = [

    path(
        "create-template/",
        create_timetable_template,
        name="create_template"
    ),

    path(
        "update-template/",
        update_timetable_template,
        name="update_template"
    ),

    path(
        "get-template/",
        get_timetable_template,
        name="get_template"
    ),
]
