from django.urls import path
from .views import (
    add_allocation,
    get_allocations,
    get_single_allocation,
    update_allocation,
    delete_allocation
)

urlpatterns = [
    # Specific patterns FIRST (in order of specificity)
    path('new_allocation/', add_allocation, name='add_allocation'),
    path('all/', get_allocations, name='get_allocations'),
    
    # Update and delete patterns BEFORE the generic pattern
    path('update/<uuid:allocation_id>/', update_allocation, name='update_allocation'),
    path('delete/<uuid:allocation_id>/', delete_allocation, name='delete_allocation'),
    
    # Generic pattern LAST (this will catch anything not matched above)
    path('<uuid:allocation_id>/', get_single_allocation, name='get_single_allocation'),
]