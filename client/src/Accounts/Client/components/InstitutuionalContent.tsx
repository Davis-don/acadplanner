import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useToast } from '../../../store/useToaststore';
import './institutuionalcontent.css'

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string | null;
}

interface InstitutionUpdateResponse {
  message: string;
  institution_name: string;
}

interface ApiError {
  error?: string;
  institution_name?: string[];
  [key: string]: string[] | string | undefined;
}

const apiUrl = import.meta.env.VITE_API_URL;

const fetchUserProfile = async (): Promise<{ user: UserProfile }> => {
  const response = await fetch(`${apiUrl}/users/fetch_user_profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

function InstitutionContent() {
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    retry: 1,
  });
  
  const [institutionName, setInstitutionName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const updateInstitutionMutation = useMutation<
    InstitutionUpdateResponse,
    ApiError,
    { institution_name: string }
  >({
    mutationFn: async (institutionData) => {
      const response = await fetch(`${apiUrl}/users/update_institution/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(institutionData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw { error: 'Please log in to update institution' };
        }
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Updating institution...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message, 'success', 4);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
      setFormError('');
    },

    onError: (error) => {
      if (typeof error === 'object') {
        if (error.error) {
          setFormError(typeof error.error === 'string' ? error.error : error.error[0]);
          showToast(typeof error.error === 'string' ? error.error : error.error[0], 'error', 5);
          return;
        }

        if (error.institution_name) {
          const errorMsg = Array.isArray(error.institution_name) 
            ? error.institution_name[0] 
            : error.institution_name;
          setFormError(errorMsg);
          showToast(errorMsg, 'error', 5);
          return;
        }

        const firstErrorKey = Object.keys(error)[0];
        if (firstErrorKey && error[firstErrorKey]) {
          const errorMsg = Array.isArray(error[firstErrorKey]) 
            ? error[firstErrorKey][0] 
            : String(error[firstErrorKey]);
          setFormError(errorMsg);
          showToast(errorMsg, 'error', 5);
        } else {
          setFormError('Failed to update institution. Please try again.');
          showToast('Failed to update institution. Please try again.', 'error', 5);
        }
      } else {
        setFormError('An unexpected error occurred.');
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  // Initialize form when user data loads
  if (userData?.user?.institution_name && institutionName === '' && !isEditing) {
    setInstitutionName(userData.user.institution_name);
  }

  const handleEditClick = () => {
    setIsEditing(true);
    setFormError('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setInstitutionName(userData?.user?.institution_name || '');
    setFormError('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInstitutionName(e.target.value);
    if (formError) setFormError('');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!institutionName.trim()) {
      setFormError('Institution name cannot be empty');
      showToast('Institution name cannot be empty', 'error', 4);
      return;
    }

    updateInstitutionMutation.mutate({ institution_name: institutionName.trim() });
  };

  if (isLoading) {
    return (
      <div className="inst-wrapper">
        <div className="inst-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inst-wrapper">
        <div className="inst-error">
          <h1>Error loading profile</h1>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email.split('@')[0];
  const hasInstitution = !!user?.institution_name;
  const isSubmitting = updateInstitutionMutation.isPending;

  return (
    <div className="inst-wrapper">
      <div className="inst-header">
        <h1 className="inst-title">Institution Settings</h1>
      </div>
      
      <div className="inst-content">
        <div className="inst-user-card">
          <div className="inst-user-info">
            <div className="inst-user-item">
              <div className="inst-user-label">Name</div>
              <div className="inst-user-value">{displayName}</div>
            </div>
            <div className="inst-user-item">
              <div className="inst-user-label">Email</div>
              <div className="inst-user-value">{user?.email}</div>
            </div>
            <div className="inst-user-item">
              <div className="inst-user-label">Role</div>
              <div className="inst-role">{user?.role}</div>
            </div>
          </div>
        </div>

        <div className="inst-institution-card">
          <div className="inst-card-header">
            <h2 className="inst-card-title">Institution Information</h2>
          </div>
          
          <div className="inst-card-content">
            {isEditing ? (
              <form className="inst-form" onSubmit={handleSubmit}>
                <div className="inst-form-group">
                  <label className="inst-form-label" htmlFor="institution_name">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    id="institution_name"
                    value={institutionName}
                    onChange={handleInputChange}
                    className={`inst-form-input ${formError ? 'inst-input-error' : ''}`}
                    placeholder="Enter institution name..."
                    disabled={isSubmitting}
                    autoComplete="off"
                    autoFocus
                  />
                  {formError && (
                    <div className="inst-error-msg">{formError}</div>
                  )}
                </div>

                <div className="inst-form-actions">
                  <button
                    type="button"
                    className="inst-btn-secondary"
                    onClick={handleCancelClick}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inst-btn-primary"
                    disabled={isSubmitting || !institutionName.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inst-loading-spinner"></span>
                        {hasInstitution ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      hasInstitution ? 'Update' : 'Add Institution'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="inst-info-display">
                <div className="inst-info-row">
                  <div className="inst-info-label">Institution Status</div>
                  <div className={`inst-status-badge ${hasInstitution ? 'inst-status-active' : 'inst-status-inactive'}`}>
                    {hasInstitution ? 'Registered' : 'Not Registered'}
                  </div>
                </div>
                
                <div className="inst-info-row">
                  <div className="inst-info-label">Institution Name</div>
                  <div className="inst-info-value">
                    {user?.institution_name || 'No institution registered'}
                  </div>
                </div>
                
                <div className="inst-actions">
                  <button 
                    className="inst-edit-btn"
                    onClick={handleEditClick}
                    disabled={isSubmitting}
                  >
                    {hasInstitution ? 'Edit Institution' : 'Add Institution'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstitutionContent;