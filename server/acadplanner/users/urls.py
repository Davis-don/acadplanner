from django.urls import path
from .views import New_user

urlpatterns = [
    path('new_account/', New_user, name='new_user'),
]
