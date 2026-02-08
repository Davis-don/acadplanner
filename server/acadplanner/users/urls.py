# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    New_user, 
    CustomTokenObtainPairView, 
    check_auth, 
    logout_user, 
    update_or_create_institution, 
    fetch_user_profile,
    update_user_profile,
    update_password  # Add this import
)

urlpatterns = [
    path('new_account/', New_user, name='new_user'),
    path('api_token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api_token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check_auth/', check_auth, name='check_auth'),
    path('logout/', logout_user, name='logout_user'),
    path("update_institution/", update_or_create_institution, name="update_institution"),
    path("fetch_user_profile/", fetch_user_profile, name="fetch_user_profile"),
    path("update_profile/", update_user_profile, name="update_profile"),
    path("update_password/", update_password, name="update_password"),  # Add this line
]