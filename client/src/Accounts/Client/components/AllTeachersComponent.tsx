import './allteacherscomponent.css';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface Teacher {
  teacher_id: string;
  teacher_name: string;
  teacher_code: string;
  created_at: string;
  updated_at: string;
}

interface TeachersResponse {
  message: string;
  teachers: Teacher[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

interface EditFormData {
  teacher_name: string;
  teacher_code: string;
}

function AllTeachersComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    teacherId: string;
    teacherName: string;
  }>({
    isOpen: false,
    teacherId: '',
    teacherName: ''
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({
    teacher_name: '',
    teacher_code: ''
  });
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch teachers
  const { 
    data: teachersData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch 
  } = useQuery<TeachersResponse, ApiError>({
    queryKey: ['userTeachers'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/teachers/my_teachers/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view teachers'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        throw { non_field_errors: ['Failed to load teachers. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await fetch(`${apiUrl}/teachers/${teacherId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete teachers');
        }
        if (response.status === 404) {
          throw new Error('Teacher not found');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete teacher');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Teacher deleted successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userTeachers'] });
      setDeleteModal({ isOpen: false, teacherId: '', teacherName: '' });
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
      setDeleteModal({ isOpen: false, teacherId: '', teacherName: '' });
    },
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async ({ teacherId, data }: { teacherId: string; data: EditFormData }) => {
      const response = await fetch(`${apiUrl}/teachers/${teacherId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to update teachers');
        }
        if (response.status === 404) {
          throw new Error('Teacher not found');
        }
        if (response.status === 400) {
          const result = await response.json();
          const errors = Object.values(result).flat().filter(Boolean);
          throw new Error(errors.length > 0 ? errors.join(', ') : 'Invalid data');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('Failed to update teacher');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Teacher updated successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userTeachers'] });
      setEditingTeacher(null);
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
    },
  });

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      teacher_name: teacher.teacher_name,
      teacher_code: teacher.teacher_code
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      // Validate
      if (!editFormData.teacher_name.trim()) {
        showToast('Teacher name is required', 'error', 4);
        return;
      }
      if (!editFormData.teacher_code.trim()) {
        showToast('Teacher code is required', 'error', 4);
        return;
      }
      if (editFormData.teacher_code.length > 20) {
        showToast('Teacher code cannot exceed 20 characters', 'error', 4);
        return;
      }
      if (!/^[A-Z0-9]+$/.test(editFormData.teacher_code)) {
        showToast('Teacher code can only contain uppercase letters and numbers', 'error', 4);
        return;
      }
      
      updateTeacherMutation.mutate({
        teacherId: editingTeacher.teacher_id,
        data: editFormData
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
  };

  const openDeleteModal = (teacherId: string, teacherName: string) => {
    setDeleteModal({
      isOpen: true,
      teacherId,
      teacherName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      teacherId: '',
      teacherName: ''
    });
  };

  const confirmDelete = () => {
    if (deleteModal.teacherId) {
      deleteTeacherMutation.mutate(deleteModal.teacherId);
    }
  };

  const handleRefresh = () => {
    setError(null);
    refetch();
    showToast('Refreshing teachers...', 'info', 2);
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
    const key = name as keyof EditFormData;
    
    // Auto-uppercase for teacher code
    const processedValue = key === 'teacher_code' ? value.toUpperCase() : value;
    
    setEditFormData(prev => ({ ...prev, [key]: processedValue }));
  };

  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.non_field_errors?.[0] || 
                          'Failed to load teachers. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [queryError, showToast]);

  const teachers = teachersData?.teachers || [];
  const isDeleting = deleteTeacherMutation.isPending;
  const isUpdating = updateTeacherMutation.isPending;

  return (
    <>
      <div className="all-teachers-container">
        <div className="all-teachers-header">
          <div className="all-teachers-header-content">
            <h1 className="all-teachers-title">My Teachers</h1>
            <div className="all-teachers-count">
              {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="all-teachers-header-actions">
            <button 
              className="all-teachers-refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading || isDeleting || isUpdating}
            >
              <svg className="all-teachers-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="all-teachers-error">
            <div className="all-teachers-error-icon">⚠️</div>
            <div className="all-teachers-error-title">Unable to load teachers</div>
            <div className="all-teachers-error-message">{error}</div>
            <button 
              className="all-teachers-error-retry-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="all-teachers-loading">
            <div className="all-teachers-loading-spinner"></div>
            <div className="all-teachers-loading-text">Loading teachers...</div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="all-teachers-empty">
            <div className="all-teachers-empty-icon">👨‍🏫</div>
            <div className="all-teachers-empty-title">No teachers found</div>
            <div className="all-teachers-empty-message">
              You haven't created any teachers yet. Switch to "Add New Teacher" to create your first teacher.
            </div>
          </div>
        ) : (
          <div className="all-teachers-table-container">
            <table className="all-teachers-table">
              <thead>
                <tr>
                  <th className="all-teachers-table-header">Teacher Name</th>
                  <th className="all-teachers-table-header">Teacher Code</th>
                  <th className="all-teachers-table-header">Created</th>
                  <th className="all-teachers-table-header">Last Updated</th>
                  <th className="all-teachers-table-header all-teachers-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="all-teachers-table-row">
                    {editingTeacher?.teacher_id === teacher.teacher_id ? (
                      // Edit mode
                      <>
                        <td className="all-teachers-table-cell">
                          <input
                            type="text"
                            name="teacher_name"
                            value={editFormData.teacher_name}
                            onChange={handleEditInputChange}
                            className="all-teachers-edit-input"
                            disabled={isUpdating}
                            placeholder="Teacher Name"
                            maxLength={100}
                          />
                        </td>
                        <td className="all-teachers-table-cell">
                          <input
                            type="text"
                            name="teacher_code"
                            value={editFormData.teacher_code}
                            onChange={handleEditInputChange}
                            className="all-teachers-edit-input all-teachers-edit-code-input"
                            disabled={isUpdating}
                            placeholder="Teacher Code"
                            maxLength={20}
                          />
                        </td>
                        <td className="all-teachers-table-cell">{formatDate(teacher.created_at)}</td>
                        <td className="all-teachers-table-cell">{formatDate(teacher.updated_at)}</td>
                        <td className="all-teachers-table-cell all-teachers-actions-cell">
                          <div className="all-teachers-edit-actions">
                            <button
                              className="all-teachers-save-btn"
                              onClick={handleEditSubmit}
                              disabled={isUpdating || !editFormData.teacher_name.trim() || !editFormData.teacher_code.trim()}
                            >
                              {isUpdating ? (
                                <span className="all-teachers-action-spinner"></span>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              className="all-teachers-cancel-btn"
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
                        <td className="all-teachers-table-cell all-teachers-name-cell">
                          <span className="all-teachers-name">{teacher.teacher_name}</span>
                        </td>
                        <td className="all-teachers-table-cell">
                          <span className="all-teachers-code-badge">{teacher.teacher_code}</span>
                        </td>
                        <td className="all-teachers-table-cell">{formatDate(teacher.created_at)}</td>
                        <td className="all-teachers-table-cell">{formatDate(teacher.updated_at)}</td>
                        <td className="all-teachers-table-cell all-teachers-actions-cell">
                          <div className="all-teachers-action-buttons">
                            <button
                              className="all-teachers-action-btn all-teachers-edit-action-btn"
                              onClick={() => handleEditClick(teacher)}
                              disabled={isDeleting || isUpdating}
                              title="Edit"
                            >
                              <svg className="all-teachers-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="all-teachers-action-btn all-teachers-delete-action-btn"
                              onClick={() => openDeleteModal(teacher.teacher_id, teacher.teacher_name)}
                              disabled={isDeleting || isUpdating}
                              title="Delete"
                            >
                              <svg className="all-teachers-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="all-teachers-delete-modal-overlay">
          <div className="all-teachers-delete-modal">
            <div className="all-teachers-delete-modal-header">
              <h3 className="all-teachers-delete-modal-title">Delete Teacher</h3>
              <button 
                className="all-teachers-delete-modal-close"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                &times;
              </button>
            </div>
            
            <div className="all-teachers-delete-modal-content">
              <div className="all-teachers-delete-warning-icon">⚠️</div>
              <p className="all-teachers-delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.teacherName}"</strong>?
              </p>
              <p className="all-teachers-delete-modal-warning">
                This action cannot be undone. All data associated with this teacher will be permanently removed.
              </p>
            </div>
            
            <div className="all-teachers-delete-modal-actions">
              <button
                className="all-teachers-delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="all-teachers-delete-modal-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="all-teachers-delete-loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Teacher'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AllTeachersComponent;