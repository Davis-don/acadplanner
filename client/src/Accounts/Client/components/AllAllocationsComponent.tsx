import './allallocations.css';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface Allocation {
  allocation_id: string;
  teacher: string;  // Teacher UUID
  teacher_name: string;
  subject: string;  // Subject UUID
  subject_name: string;
  school_class: string;  // Class UUID
  class_name: string;
  stream: string;
  number_of_lessons: number;
  created_at: string;
  updated_at: string;
}

interface AllocationsResponse {
  message: string;
  allocations: Allocation[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

interface EditFormData {
  number_of_lessons: number;
}

// Helper function to get CSRF token for Django
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function AllAllocationsComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    allocationId: string;
    allocationDetails: string;
  }>({
    isOpen: false,
    allocationId: '',
    allocationDetails: ''
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({
    number_of_lessons: 1,
  });
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL 

  // Fetch allocations
  const { 
    data: allocationsData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch 
  } = useQuery<AllocationsResponse, ApiError>({
    queryKey: ['userAllocations'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/allocations/all/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view allocations'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch allocations:', error);
        throw { non_field_errors: ['Failed to load allocations. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Delete allocation mutation - FIXED URL
  const deleteAllocationMutation = useMutation({
    mutationFn: async (allocationId: string) => {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${apiUrl}/allocations/delete/${allocationId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete allocations');
        }
        if (response.status === 404) {
          throw new Error('Allocation not found');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete allocation');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Allocation deleted successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userAllocations'] });
      setDeleteModal({ isOpen: false, allocationId: '', allocationDetails: '' });
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
      setDeleteModal({ isOpen: false, allocationId: '', allocationDetails: '' });
    },
  });

  // Update allocation mutation - FIXED URL
  const updateAllocationMutation = useMutation({
    mutationFn: async ({ allocationId, data }: { allocationId: string; data: EditFormData }) => {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${apiUrl}/allocations/update/${allocationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to update allocations');
        }
        if (response.status === 404) {
          throw new Error('Allocation not found');
        }
        if (response.status === 400) {
          const result = await response.json();
          const errors = Object.values(result).flat().filter(Boolean);
          throw new Error(errors.length > 0 ? errors.join(', ') : 'Invalid data');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('Failed to update allocation');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Allocation updated successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userAllocations'] });
      setEditingAllocation(null);
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
    },
  });

  const handleEditClick = (allocation: Allocation) => {
    setEditingAllocation(allocation);
    setEditFormData({
      number_of_lessons: allocation.number_of_lessons
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAllocation) {
      // Validate
      if (editFormData.number_of_lessons < 1 || editFormData.number_of_lessons > 40) {
        showToast('Number of lessons must be between 1 and 40', 'error', 4);
        return;
      }
      
      updateAllocationMutation.mutate({
        allocationId: editingAllocation.allocation_id,
        data: editFormData
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAllocation(null);
  };

  const openDeleteModal = (allocationId: string, teacherName: string, subjectName: string, className: string) => {
    setDeleteModal({
      isOpen: true,
      allocationId,
      allocationDetails: `${teacherName} → ${subjectName} → ${className}`
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      allocationId: '',
      allocationDetails: ''
    });
  };

  const confirmDelete = () => {
    if (deleteModal.allocationId) {
      deleteAllocationMutation.mutate(deleteModal.allocationId);
    }
  };

  const handleRefresh = () => {
    setError(null);
    refetch();
    showToast('Refreshing allocations...', 'info', 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only field on the form is number_of_lessons, parse and ensure a number is stored
    if (name === 'number_of_lessons') {
      const parsed = parseInt(value, 10);
      setEditFormData(prev => ({
        ...prev,
        number_of_lessons: isNaN(parsed) ? 1 : parsed,
      }));
    }
  };

  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.non_field_errors?.[0] || 
                          'Failed to load allocations. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [queryError, showToast]);

  const allocations = allocationsData?.allocations || [];
  const isDeleting = deleteAllocationMutation.isPending;
  const isUpdating = updateAllocationMutation.isPending;

  return (
    <>
      <div className="all-allocations-container">
        <div className="all-allocations-header">
          <div className="all-allocations-header-content">
            <h1 className="all-allocations-title">My Allocations</h1>
            <div className="all-allocations-count">
              {allocations.length} allocation{allocations.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="all-allocations-header-actions">
            <button 
              className="all-allocations-refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading || isDeleting || isUpdating}
            >
              <svg className="all-allocations-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="all-allocations-error">
            <div className="all-allocations-error-icon">⚠️</div>
            <div className="all-allocations-error-title">Unable to load allocations</div>
            <div className="all-allocations-error-message">{error}</div>
            <button 
              className="all-allocations-error-retry-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="all-allocations-loading">
            <div className="all-allocations-loading-spinner"></div>
            <div className="all-allocations-loading-text">Loading allocations...</div>
          </div>
        ) : allocations.length === 0 ? (
          <div className="all-allocations-empty">
            <div className="all-allocations-empty-icon">📊</div>
            <div className="all-allocations-empty-title">No allocations found</div>
            <div className="all-allocations-empty-message">
              You haven't created any allocations yet. Switch to "Create Allocation" to assign teachers to subjects and classes.
            </div>
          </div>
        ) : (
          <div className="all-allocations-table-container">
            <table className="all-allocations-table">
              <thead>
                <tr>
                  <th className="all-allocations-table-header">Teacher</th>
                  <th className="all-allocations-table-header">Subject</th>
                  <th className="all-allocations-table-header">Class</th>
                  <th className="all-allocations-table-header">Stream</th>
                  <th className="all-allocations-table-header">Lessons/Week</th>
                  <th className="all-allocations-table-header">Created</th>
                  <th className="all-allocations-table-header all-allocations-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => (
                  <tr key={allocation.allocation_id} className="all-allocations-table-row">
                    {editingAllocation?.allocation_id === allocation.allocation_id ? (
                      // Edit mode
                      <>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-teacher-info">
                            <span className="all-allocations-teacher-name">{allocation.teacher_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-subject-info">
                            <span className="all-allocations-subject-name">{allocation.subject_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-class-info">
                            <span className="all-allocations-class-name">{allocation.class_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <span className="all-allocations-stream-badge">{allocation.stream}</span>
                        </td>
                        <td className="all-allocations-table-cell">
                          <input
                            type="number"
                            name="number_of_lessons"
                            value={editFormData.number_of_lessons}
                            onChange={handleEditInputChange}
                            className="all-allocations-edit-input all-allocations-lessons-input"
                            disabled={isUpdating}
                            min="1"
                            max="40"
                          />
                        </td>
                        <td className="all-allocations-table-cell">{formatDate(allocation.created_at)}</td>
                        <td className="all-allocations-table-cell all-allocations-actions-cell">
                          <div className="all-allocations-edit-actions">
                            <button
                              className="all-allocations-save-btn"
                              onClick={handleEditSubmit}
                              disabled={isUpdating || editFormData.number_of_lessons < 1 || editFormData.number_of_lessons > 40}
                            >
                              {isUpdating ? (
                                <span className="all-allocations-action-spinner"></span>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              className="all-allocations-cancel-btn"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-teacher-info">
                            <div className="all-allocations-teacher-avatar">
                              {allocation.teacher_name.charAt(0)}
                            </div>
                            <span className="all-allocations-teacher-name">{allocation.teacher_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-subject-info">
                            <div className="all-allocations-subject-icon">📚</div>
                            <span className="all-allocations-subject-name">{allocation.subject_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-class-info">
                            <div className="all-allocations-class-icon">🏫</div>
                            <span className="all-allocations-class-name">{allocation.class_name}</span>
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">
                          <span className="all-allocations-stream-badge">{allocation.stream}</span>
                        </td>
                        <td className="all-allocations-table-cell">
                          <div className="all-allocations-lessons-badge">
                            {allocation.number_of_lessons} lesson{allocation.number_of_lessons !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="all-allocations-table-cell">{formatDate(allocation.created_at)}</td>
                        <td className="all-allocations-table-cell all-allocations-actions-cell">
                          <div className="all-allocations-action-buttons">
                            <button
                              className="all-allocations-action-btn all-allocations-edit-action-btn"
                              onClick={() => handleEditClick(allocation)}
                              disabled={isDeleting || isUpdating}
                              title="Edit Lessons"
                            >
                              <svg className="all-allocations-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="all-allocations-action-btn all-allocations-delete-action-btn"
                              onClick={() => openDeleteModal(allocation.allocation_id, allocation.teacher_name, allocation.subject_name, allocation.class_name)}
                              disabled={isDeleting || isUpdating}
                              title="Delete"
                            >
                              <svg className="all-allocations-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="all-allocations-delete-modal-overlay">
          <div className="all-allocations-delete-modal">
            <div className="all-allocations-delete-modal-header">
              <h3 className="all-allocations-delete-modal-title">Delete Allocation</h3>
              <button 
                className="all-allocations-delete-modal-close"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                &times;
              </button>
            </div>
            
            <div className="all-allocations-delete-modal-content">
              <div className="all-allocations-delete-warning-icon">⚠️</div>
              <p className="all-allocations-delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.allocationDetails}"</strong>?
              </p>
              <p className="all-allocations-delete-modal-warning">
                This action cannot be undone. The allocation will be permanently removed.
              </p>
            </div>
            
            <div className="all-allocations-delete-modal-actions">
              <button
                className="all-allocations-delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="all-allocations-delete-modal-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="all-allocations-delete-loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Allocation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AllAllocationsComponent;