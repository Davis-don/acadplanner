import './allsubjectcomponent.css';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  created_at: string;
  updated_at: string;
}

interface SubjectsResponse {
  message: string;
  subjects: Subject[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

interface EditFormData {
  subject_name: string;
  subject_code: string;
}

function Allsubjectscomponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subjectId: string;
    subjectName: string;
  }>({
    isOpen: false,
    subjectId: '',
    subjectName: ''
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({
    subject_name: '',
    subject_code: ''
  });
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch subjects
  const { 
    data: subjectsData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch 
  } = useQuery<SubjectsResponse, ApiError>({
    queryKey: ['userSubjects'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/subjects/my_subjects/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view subjects'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        throw { non_field_errors: ['Failed to load subjects. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const response = await fetch(`${apiUrl}/subjects/delete_subject/${subjectId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete subjects');
        }
        if (response.status === 404) {
          throw new Error('Subject not found');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete subject');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Subject deleted successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
      setDeleteModal({ isOpen: false, subjectId: '', subjectName: '' });
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
      setDeleteModal({ isOpen: false, subjectId: '', subjectName: '' });
    },
  });

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: async ({ subjectId, data }: { subjectId: string; data: EditFormData }) => {
      const response = await fetch(`${apiUrl}/subjects/update-subject/${subjectId}/`, {
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
          throw new Error('Please log in to update subjects');
        }
        if (response.status === 404) {
          throw new Error('Subject not found');
        }
        if (response.status === 400) {
          const result = await response.json();
          const errors = Object.values(result).flat().filter(Boolean);
          throw new Error(errors.length > 0 ? errors.join(', ') : 'Invalid data');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('Failed to update subject');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Subject updated successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userSubjects'] });
      setEditingSubject(null);
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
    },
  });

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setEditFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      // Validate
      if (!editFormData.subject_name.trim()) {
        showToast('Subject name is required', 'error', 4);
        return;
      }
      if (!editFormData.subject_code.trim()) {
        showToast('Subject code is required', 'error', 4);
        return;
      }
      if (editFormData.subject_code.length > 20) {
        showToast('Subject code cannot exceed 20 characters', 'error', 4);
        return;
      }
      if (!/^[A-Z0-9]+$/.test(editFormData.subject_code)) {
        showToast('Subject code can only contain uppercase letters and numbers', 'error', 4);
        return;
      }
      
      updateSubjectMutation.mutate({
        subjectId: editingSubject.subject_id,
        data: editFormData
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
  };

  const openDeleteModal = (subjectId: string, subjectName: string) => {
    setDeleteModal({
      isOpen: true,
      subjectId,
      subjectName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      subjectId: '',
      subjectName: ''
    });
  };

  const confirmDelete = () => {
    if (deleteModal.subjectId) {
      deleteSubjectMutation.mutate(deleteModal.subjectId);
    }
  };

  const handleRefresh = () => {
    setError(null);
    refetch();
    showToast('Refreshing subjects...', 'info', 2);
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
    
    // Auto-uppercase for subject code
    const processedValue = key === 'subject_code' ? value.toUpperCase() : value;
    
    setEditFormData(prev => ({ ...prev, [key]: processedValue }));
  };

  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.non_field_errors?.[0] || 
                          'Failed to load subjects. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [queryError, showToast]);

  const subjects = subjectsData?.subjects || [];
  const isDeleting = deleteSubjectMutation.isPending;
  const isUpdating = updateSubjectMutation.isPending;

  return (
    <>
      <div className="all-subjects-container">
        <div className="all-subjects-header">
          <div className="all-subjects-header-content">
            <h1 className="all-subjects-title">My Subjects</h1>
            <div className="all-subjects-count">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="all-subjects-header-actions">
            <button 
              className="all-subjects-refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading || isDeleting || isUpdating}
            >
              <svg className="all-subjects-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="all-subjects-error">
            <div className="all-subjects-error-icon">⚠️</div>
            <div className="all-subjects-error-title">Unable to load subjects</div>
            <div className="all-subjects-error-message">{error}</div>
            <button 
              className="all-subjects-error-retry-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="all-subjects-loading">
            <div className="all-subjects-loading-spinner"></div>
            <div className="all-subjects-loading-text">Loading subjects...</div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="all-subjects-empty">
            <div className="all-subjects-empty-icon">📚</div>
            <div className="all-subjects-empty-title">No subjects found</div>
            <div className="all-subjects-empty-message">
              You haven't created any subjects yet. Switch to "Add New Subject" to create your first subject.
            </div>
          </div>
        ) : (
          <div className="all-subjects-table-container">
            <table className="all-subjects-table">
              <thead>
                <tr>
                  <th className="all-subjects-table-header">Subject Name</th>
                  <th className="all-subjects-table-header">Subject Code</th>
                  <th className="all-subjects-table-header">Created</th>
                  <th className="all-subjects-table-header">Last Updated</th>
                  <th className="all-subjects-table-header all-subjects-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.subject_id} className="all-subjects-table-row">
                    {editingSubject?.subject_id === subject.subject_id ? (
                      // Edit mode
                      <>
                        <td className="all-subjects-table-cell">
                          <input
                            type="text"
                            name="subject_name"
                            value={editFormData.subject_name}
                            onChange={handleEditInputChange}
                            className="all-subjects-edit-input"
                            disabled={isUpdating}
                            placeholder="Subject Name"
                            maxLength={100}
                          />
                        </td>
                        <td className="all-subjects-table-cell">
                          <input
                            type="text"
                            name="subject_code"
                            value={editFormData.subject_code}
                            onChange={handleEditInputChange}
                            className="all-subjects-edit-input all-subjects-edit-code-input"
                            disabled={isUpdating}
                            placeholder="Subject Code"
                            maxLength={20}
                          />
                        </td>
                        <td className="all-subjects-table-cell">{formatDate(subject.created_at)}</td>
                        <td className="all-subjects-table-cell">{formatDate(subject.updated_at)}</td>
                        <td className="all-subjects-table-cell all-subjects-actions-cell">
                          <div className="all-subjects-edit-actions">
                            <button
                              className="all-subjects-save-btn"
                              onClick={handleEditSubmit}
                              disabled={isUpdating || !editFormData.subject_name.trim() || !editFormData.subject_code.trim()}
                            >
                              {isUpdating ? (
                                <span className="all-subjects-action-spinner"></span>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              className="all-subjects-cancel-btn"
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
                        <td className="all-subjects-table-cell all-subjects-name-cell">
                          <span className="all-subjects-name">{subject.subject_name}</span>
                        </td>
                        <td className="all-subjects-table-cell">
                          <span className="all-subjects-code-badge">{subject.subject_code}</span>
                        </td>
                        <td className="all-subjects-table-cell">{formatDate(subject.created_at)}</td>
                        <td className="all-subjects-table-cell">{formatDate(subject.updated_at)}</td>
                        <td className="all-subjects-table-cell all-subjects-actions-cell">
                          <div className="all-subjects-action-buttons">
                            <button
                              className="all-subjects-action-btn all-subjects-edit-action-btn"
                              onClick={() => handleEditClick(subject)}
                              disabled={isDeleting || isUpdating}
                              title="Edit"
                            >
                              <svg className="all-subjects-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="all-subjects-action-btn all-subjects-delete-action-btn"
                              onClick={() => openDeleteModal(subject.subject_id, subject.subject_name)}
                              disabled={isDeleting || isUpdating}
                              title="Delete"
                            >
                              <svg className="all-subjects-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="all-subjects-delete-modal-overlay">
          <div className="all-subjects-delete-modal">
            <div className="all-subjects-delete-modal-header">
              <h3 className="all-subjects-delete-modal-title">Delete Subject</h3>
              <button 
                className="all-subjects-delete-modal-close"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                &times;
              </button>
            </div>
            
            <div className="all-subjects-delete-modal-content">
              <div className="all-subjects-delete-warning-icon">⚠️</div>
              <p className="all-subjects-delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.subjectName}"</strong>?
              </p>
              <p className="all-subjects-delete-modal-warning">
                This action cannot be undone. All data associated with this subject will be permanently removed.
              </p>
            </div>
            
            <div className="all-subjects-delete-modal-actions">
              <button
                className="all-subjects-delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="all-subjects-delete-modal-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="all-subjects-delete-loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Allsubjectscomponent;