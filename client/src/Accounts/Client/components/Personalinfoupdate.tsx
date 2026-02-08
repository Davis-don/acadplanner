import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';
import type { FormEvent, ChangeEvent } from 'react';
import './Personalinfoupdate.css';

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
}

interface UpdateProfileData {
  email: string;
  first_name: string;
  last_name: string;
}

interface ProfileResponse {
  message: string;
  user: UserProfile;
}

interface UpdateProfileResponse {
  message: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface ApiError {
  [key: string]: string | string[] | undefined;
  non_field_errors?: string[];
  error?: string;
}

function Personalinfoupdate() {
  const [formData, setFormData] = useState<UserProfile>({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [originalData, setOriginalData] = useState<UserProfile>({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  const [isModified, setIsModified] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const apiUrl = import.meta.env.VITE_API_URL

  // Fetch user profile
  const { 
    data: profileData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<ProfileResponse, ApiError>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/users/fetch_user_profile/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw { error: 'Please log in to view your profile' };
        }
        throw await response.json();
      }

      return await response.json();
    },
    retry: 1,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation<
    UpdateProfileResponse,
    ApiError,
    UpdateProfileData
  >({
    mutationFn: async (updateData: UpdateProfileData) => {
      const response = await fetch(`${apiUrl}/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw result;
        }
        throw { error: 'Failed to update profile' };
      }

      return result;
    },
    onMutate: () => {
      showToast('Updating profile...', 'info', 3);
    },
    onSuccess: (data) => {
      showToast(data.message || 'Profile updated successfully!', 'success', 4);
      
      // Update local state
      setFormData(data.user);
      setOriginalData(data.user);
      setIsModified(false);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      if (error.error) {
        showToast(error.error, 'error', 5);
      } else if (error.non_field_errors) {
        showToast(error.non_field_errors[0], 'error', 5);
      } else if (typeof error === 'object') {
        const firstError = Object.values(error)[0];
        if (Array.isArray(firstError)) {
          showToast(firstError[0], 'error', 5);
        } else if (typeof firstError === 'string') {
          showToast(firstError, 'error', 5);
        }
      } else {
        showToast('Failed to update profile', 'error', 5);
      }
    },
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (profileData?.user) {
      const userData = {
        email: profileData.user.email || '',
        first_name: profileData.user.first_name || '',
        last_name: profileData.user.last_name || ''
      };
      setFormData(userData);
      setOriginalData(userData);
      setIsModified(false);
    }
  }, [profileData]);

  // Check if form is modified
  useEffect(() => {
    const modified = 
      formData.email !== originalData.email ||
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name;
    setIsModified(modified);
  }, [formData, originalData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof UserProfile;
    
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email cannot exceed 254 characters';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = 'First name cannot exceed 100 characters';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = 'Last name cannot exceed 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) showToast(firstError, 'error', 4);
      return;
    }
    
    const updateData: UpdateProfileData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name
    };
    
    updateProfileMutation.mutate(updateData);
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setIsModified(false);
  };

  if (isLoading) {
    return (
      <div className="personal-info-update-loading">
        <div className="personal-info-update-loading-spinner"></div>
        <div className="personal-info-update-loading-text">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error.error || error.non_field_errors?.[0] || 'Failed to load profile';
    
    return (
      <div className="personal-info-update-error">
        <div className="personal-info-update-error-icon">⚠️</div>
        <div className="personal-info-update-error-message">{errorMessage}</div>
        <button 
          className="personal-info-update-error-retry-btn"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <div className="personal-info-update-container">
      <h2 className="personal-info-update-title">Update Personal Information</h2>
      
      <form className="personal-info-update-form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="personal-info-update-form-group">
          <label className="personal-info-update-form-label">
            Email Address <span className="personal-info-update-required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`personal-info-update-form-input ${errors.email ? 'personal-info-update-input-error' : ''}`}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="personal-info-update-error">{errors.email}</div>
          )}
        </div>

        {/* First Name */}
        <div className="personal-info-update-form-group">
          <label className="personal-info-update-form-label">
            First Name <span className="personal-info-update-required">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className={`personal-info-update-form-input ${errors.first_name ? 'personal-info-update-input-error' : ''}`}
            placeholder="First name"
            disabled={isSubmitting}
          />
          {errors.first_name && (
            <div className="personal-info-update-error">{errors.first_name}</div>
          )}
        </div>

        {/* Last Name */}
        <div className="personal-info-update-form-group">
          <label className="personal-info-update-form-label">
            Last Name <span className="personal-info-update-required">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className={`personal-info-update-form-input ${errors.last_name ? 'personal-info-update-input-error' : ''}`}
            placeholder="Last name"
            disabled={isSubmitting}
          />
          {errors.last_name && (
            <div className="personal-info-update-error">{errors.last_name}</div>
          )}
        </div>

        {/* Form Actions */}
        <div className="personal-info-update-form-actions">
          {isModified && (
            <button
              type="button"
              className="personal-info-update-btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            className="personal-info-update-btn-primary"
            disabled={isSubmitting || !isModified}
          >
            {isSubmitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Personalinfoupdate;