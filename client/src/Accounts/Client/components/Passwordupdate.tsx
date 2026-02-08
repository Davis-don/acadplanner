import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';
import type { FormEvent, ChangeEvent } from 'react';
import './passwordupdate.css';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface UpdatePasswordResponse {
  message: string;
}

interface ApiError {
  [key: string]: string | string[] | undefined;
  non_field_errors?: string[];
  error?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

function Passwordupdate() {
  const [formData, setFormData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const { showToast } = useToast();
  
  const apiUrl = import.meta.env.VITE_API_URL;

  // Update password mutation
  const updatePasswordMutation = useMutation<
    UpdatePasswordResponse,
    ApiError,
    PasswordFormData
  >({
    mutationFn: async (passwordData: PasswordFormData) => {
      const response = await fetch(`${apiUrl}/users/update_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw result;
        }
        throw { error: 'Failed to update password' };
      }

      return result;
    },
    onMutate: () => {
      showToast('Updating password...', 'info', 3);
    },
    onSuccess: (data) => {
      showToast(data.message || 'Password updated successfully!', 'success', 4);
      
      // Reset form on success
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setErrors({});
    },
    onError: (error) => {
      if (error.current_password) {
        showToast(error.current_password, 'error', 5);
      } else if (error.new_password) {
        showToast(error.new_password, 'error', 5);
      } else if (error.confirm_password) {
        showToast(error.confirm_password, 'error', 5);
      } else if (error.error) {
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
        showToast('Failed to update password', 'error', 5);
      }
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof PasswordFormData;
    
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PasswordFormData, string>> = {};
    
    if (!formData.current_password.trim()) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!formData.new_password.trim()) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    } else if (formData.new_password.length > 128) {
      newErrors.new_password = 'Password cannot exceed 128 characters';
    }
    
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
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
    
    updatePasswordMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setErrors({});
    setShowPassword({
      current: false,
      new: false,
      confirm: false
    });
  };

  const isSubmitting = updatePasswordMutation.isPending;

  return (
    <div className="password-update-container">
      <h2 className="password-update-title">Update Password</h2>
      
      <form className="password-update-form" onSubmit={handleSubmit}>
        {/* Current Password */}
        <div className="password-update-form-group">
          <label className="password-update-form-label">
            Current Password <span className="password-update-required">*</span>
          </label>
          <div className="password-update-input-wrapper">
            <input
              type={showPassword.current ? "text" : "password"}
              name="current_password"
              value={formData.current_password}
              onChange={handleInputChange}
              className={`password-update-form-input ${errors.current_password ? 'password-update-input-error' : ''}`}
              placeholder="Enter your current password"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-update-toggle-btn"
              onClick={() => togglePasswordVisibility('current')}
              disabled={isSubmitting}
            >
              {showPassword.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.current_password && (
            <div className="password-update-error">{errors.current_password}</div>
          )}
        </div>

        {/* New Password */}
        <div className="password-update-form-group">
          <label className="password-update-form-label">
            New Password <span className="password-update-required">*</span>
          </label>
          <div className="password-update-input-wrapper">
            <input
              type={showPassword.new ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              className={`password-update-form-input ${errors.new_password ? 'password-update-input-error' : ''}`}
              placeholder="Enter your new password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-update-toggle-btn"
              onClick={() => togglePasswordVisibility('new')}
              disabled={isSubmitting}
            >
              {showPassword.new ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.new_password && (
            <div className="password-update-error">{errors.new_password}</div>
          )}
          <div className="password-update-hint">
            Password must be at least 8 characters long
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="password-update-form-group">
          <label className="password-update-form-label">
            Confirm New Password <span className="password-update-required">*</span>
          </label>
          <div className="password-update-input-wrapper">
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              className={`password-update-form-input ${errors.confirm_password ? 'password-update-input-error' : ''}`}
              placeholder="Confirm your new password"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-update-toggle-btn"
              onClick={() => togglePasswordVisibility('confirm')}
              disabled={isSubmitting}
            >
              {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirm_password && (
            <div className="password-update-error">{errors.confirm_password}</div>
          )}
        </div>

        {/* Form Actions */}
        <div className="password-update-form-actions">
          <button
            type="button"
            className="password-update-btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Clear
          </button>
          <button
            type="submit"
            className="password-update-btn-primary"
            disabled={isSubmitting || !formData.current_password || !formData.new_password || !formData.confirm_password}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Passwordupdate;