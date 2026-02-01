import './allclasscomponent.css';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface SchoolClass {
  class_id: string;
  class_name: string;
  stream: string;
  created_at: string;
  updated_at: string;
}

interface ClassesResponse {
  classes: SchoolClass[];
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

interface EditFormData {
  class_name: string;
  stream: string;
}

// Define the curriculum groups
const CURRICULUM_GROUPS = {
  'OLD_844': {
    name: '8-4-4 System',
    streams: ['Form 1', 'Form 2', 'Form 3', 'Form 4']
  },
  'CBE_23': {
    name: 'CBE System',
    streams: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
              'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
              'Grade 11', 'Grade 12']
  }
};

type CurriculumType = keyof typeof CURRICULUM_GROUPS;

function Allclassescomponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    classId: string;
    className: string;
  }>({
    isOpen: false,
    classId: '',
    className: ''
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({
    class_name: '',
    stream: ''
  });
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumType | ''>('');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Determine curriculum from stream
  const determineCurriculum = (stream: string): CurriculumType | '' => {
    if (stream.startsWith('Form')) return 'OLD_844';
    if (stream.startsWith('Grade')) return 'CBE_23';
    return '';
  };

  // Available streams based on selected curriculum
  const availableStreams = useMemo(() => {
    if (!selectedCurriculum || !CURRICULUM_GROUPS[selectedCurriculum]) {
      return [];
    }
    return CURRICULUM_GROUPS[selectedCurriculum].streams;
  }, [selectedCurriculum]);

  // Fetch classes
  const { 
    data: classesData, 
    isLoading: queryLoading, 
    error: queryError,
    refetch 
  } = useQuery<ClassesResponse, ApiError>({
    queryKey: ['userClasses'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/classes/my_classes/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view classes'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        throw { non_field_errors: ['Failed to load classes. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`${apiUrl}/classes/delete_class/${classId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete classes');
        }
        if (response.status === 404) {
          throw new Error('Class not found');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete class');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Class deleted successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userClasses'] });
      setDeleteModal({ isOpen: false, classId: '', className: '' });
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
      setDeleteModal({ isOpen: false, classId: '', className: '' });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ classId, data }: { classId: string; data: EditFormData }) => {
      const response = await fetch(`${apiUrl}/classes/update-class/${classId}/`, {
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
          throw new Error('Please log in to update classes');
        }
        if (response.status === 404) {
          throw new Error('Class not found');
        }
        if (response.status === 400) {
          const result = await response.json();
          const errors = Object.values(result).flat().filter(Boolean);
          throw new Error(errors.length > 0 ? errors.join(', ') : 'Invalid data');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('Failed to update class');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      showToast(data.message || 'Class updated successfully', 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userClasses'] });
      setEditingClass(null);
      setSelectedCurriculum('');
    },
    onError: (error) => {
      showToast(error.message, 'error', 5);
    },
  });

  const handleEditClick = (classItem: SchoolClass) => {
    setEditingClass(classItem);
    setEditFormData({
      class_name: classItem.class_name,
      stream: classItem.stream
    });
    
    // Determine and set the curriculum based on the stream
    const curriculum = determineCurriculum(classItem.stream);
    setSelectedCurriculum(curriculum);
  };

  const handleCurriculumSelect = (curriculum: CurriculumType) => {
    setSelectedCurriculum(curriculum);
    // Clear stream when curriculum changes
    setEditFormData(prev => ({ ...prev, stream: '' }));
  };

  const handleStreamSelect = (stream: string) => {
    setEditFormData(prev => ({ ...prev, stream }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      // Validate
      if (!editFormData.class_name.trim() || !editFormData.stream.trim()) {
        showToast('Please fill all required fields', 'error', 4);
        return;
      }
      updateClassMutation.mutate({
        classId: editingClass.class_id,
        data: editFormData
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setSelectedCurriculum('');
  };

  const openDeleteModal = (classId: string, className: string) => {
    setDeleteModal({
      isOpen: true,
      classId,
      className
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      classId: '',
      className: ''
    });
  };

  const confirmDelete = () => {
    if (deleteModal.classId) {
      deleteClassMutation.mutate(deleteModal.classId);
    }
  };

  const handleRefresh = () => {
    setError(null);
    refetch();
    showToast('Refreshing classes...', 'info', 2);
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

  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.non_field_errors?.[0] || 
                          'Failed to load classes. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [queryError, showToast]);

  const classes = classesData?.classes || [];
  const isDeleting = deleteClassMutation.isPending;
  const isUpdating = updateClassMutation.isPending;

  return (
    <>
      <div className="all-classes-container">
        <div className="all-classes-header">
          <div className="header-content">
            <h1 className="all-classes-title">My Classes</h1>
            <div className="all-classes-count">
              {classes.length} class{classes.length !== 1 ? 'es' : ''}
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading || isDeleting || isUpdating}
            >
              <svg className="refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="all-classes-error">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Unable to load classes</div>
            <div className="error-message">{error}</div>
            <button 
              className="error-retry-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="all-classes-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading classes...</div>
          </div>
        ) : classes.length === 0 ? (
          <div className="all-classes-empty">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No classes found</div>
            <div className="empty-message">
              You haven't created any classes yet. Switch to "Add New Class" to create your first class.
            </div>
          </div>
        ) : (
          <div className="classes-table-container">
            <table className="classes-table">
              <thead>
                <tr>
                  <th className="table-header">Class Name</th>
                  <th className="table-header">Stream / Grade</th>
                  <th className="table-header">Created</th>
                  <th className="table-header">Last Updated</th>
                  <th className="table-header actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem) => (
                  <tr key={classItem.class_id} className="table-row">
                    {editingClass?.class_id === classItem.class_id ? (
                      // Edit mode with curriculum selection
                      <>
                        <td className="table-cell">
                          <input
                            type="text"
                            value={editFormData.class_name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, class_name: e.target.value }))}
                            className="edit-input"
                            disabled={isUpdating}
                            placeholder="Class Name"
                          />
                        </td>
                        <td className="table-cell edit-stream-cell">
                          <div className="edit-stream-container">
                            {/* Curriculum Selection */}
                            <div className="edit-curriculum-group">
                              <div className="edit-curriculum-options">
                                {Object.entries(CURRICULUM_GROUPS).map(([key, curriculum]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    className={`edit-curriculum-btn ${selectedCurriculum === key ? 'curriculum-selected' : ''}`}
                                    onClick={() => handleCurriculumSelect(key as CurriculumType)}
                                    disabled={isUpdating}
                                  >
                                    {curriculum.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Stream Selection */}
                            {selectedCurriculum && (
                              <div className="edit-stream-selection">
                                <div className="edit-stream-grid">
                                  {availableStreams.map((stream) => (
                                    <button
                                      key={stream}
                                      type="button"
                                      className={`edit-stream-option ${editFormData.stream === stream ? 'stream-selected' : ''}`}
                                      onClick={() => handleStreamSelect(stream)}
                                      disabled={isUpdating}
                                    >
                                      {stream}
                                    </button>
                                  ))}
                                </div>
                                <div className="selected-stream-display">
                                  Selected: <strong>{editFormData.stream || 'None'}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">{formatDate(classItem.created_at)}</td>
                        <td className="table-cell">{formatDate(classItem.updated_at)}</td>
                        <td className="table-cell actions-cell">
                          <div className="edit-actions">
                            <button
                              className="save-btn"
                              onClick={handleEditSubmit}
                              disabled={isUpdating || !editFormData.class_name.trim() || !editFormData.stream.trim()}
                            >
                              {isUpdating ? (
                                <span className="action-spinner"></span>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              className="cancel-btn"
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
                        <td className="table-cell class-name-cell">
                          <span className="class-name">{classItem.class_name}</span>
                        </td>
                        <td className="table-cell">
                          <span className="stream-badge">{classItem.stream}</span>
                        </td>
                        <td className="table-cell">{formatDate(classItem.created_at)}</td>
                        <td className="table-cell">{formatDate(classItem.updated_at)}</td>
                        <td className="table-cell actions-cell">
                          <div className="action-buttons">
                            <button
                              className="action-btn edit-action-btn"
                              onClick={() => handleEditClick(classItem)}
                              disabled={isDeleting || isUpdating}
                              title="Edit"
                            >
                              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-action-btn"
                              onClick={() => openDeleteModal(classItem.class_id, classItem.class_name)}
                              disabled={isDeleting || isUpdating}
                              title="Delete"
                            >
                              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3 className="delete-modal-title">Delete Class</h3>
              <button 
                className="delete-modal-close"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                &times;
              </button>
            </div>
            
            <div className="delete-modal-content">
              <div className="delete-warning-icon">⚠️</div>
              <p className="delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.className}"</strong>?
              </p>
              <p className="delete-modal-warning">
                This action cannot be undone. All data associated with this class will be permanently removed.
              </p>
            </div>
            
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="delete-loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Class'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Allclassescomponent;