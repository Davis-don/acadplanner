import './addteacherscomponent.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface FormData {
  teacher_name: string;
  teacher_code: string;
}

interface Errors {
  teacher_name?: string;
  teacher_code?: string;
}

interface TeacherResponse {
  message: string;
  teacher: {
    teacher_id: string;
    teacher_name: string;
    teacher_code: string;
    created_at: string;
    updated_at: string;
  };
}

interface ApiError {
  [key: string]: string[];
}

function AddTeacherComponent() {
  const [formData, setFormData] = useState<FormData>({
    teacher_name: '',
    teacher_code: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { showToast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const addTeacherMutation = useMutation<
    TeacherResponse,
    ApiError,
    FormData
  >({
    mutationFn: async (teacherData) => {
      const response = await fetch(`${apiUrl}/teachers/new_teacher/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teacherData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw { non_field_errors: ['Please log in to add a teacher'] };
        }
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Adding new teacher...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message, 'success', 4);
      setSuccessMessage(`Teacher "${data.teacher.teacher_name} (${data.teacher.teacher_code})" added successfully!`);
      
      setFormData({ teacher_name: '', teacher_code: '' });
      setErrors({});
      
      setTimeout(() => setSuccessMessage(''), 5000);
    },

    onError: (error) => {
      if (typeof error === 'object') {
        if (error.non_field_errors) {
          showToast(error.non_field_errors[0], 'error', 5);
          return;
        }

        const fieldErrors: Errors = {};
        Object.keys(error).forEach(key => {
          if (error[key] && Array.isArray(error[key]) && error[key].length > 0) {
            const errorKey = key as keyof Errors;
            fieldErrors[errorKey] = error[key][0];
          }
        });
        setErrors(fieldErrors);
        
        const firstErrorKey = Object.keys(error)[0];
        if (firstErrorKey && error[firstErrorKey]?.[0]) {
          showToast(`${error[firstErrorKey][0]}`, 'error', 5);
        } else {
          showToast('Failed to add teacher. Please check your information.', 'error', 5);
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    
    // Auto-uppercase for teacher code
    const processedValue = key === 'teacher_code' ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [key]: processedValue }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    
    if (!formData.teacher_name.trim()) {
      newErrors.teacher_name = 'Teacher name is required';
    } else if (formData.teacher_name.length > 100) {
      newErrors.teacher_name = 'Teacher name cannot exceed 100 characters';
    }
    
    if (!formData.teacher_code.trim()) {
      newErrors.teacher_code = 'Teacher code is required';
    } else if (formData.teacher_code.length > 20) {
      newErrors.teacher_code = 'Teacher code cannot exceed 20 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.teacher_code)) {
      newErrors.teacher_code = 'Teacher code can only contain uppercase letters and numbers';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      addTeacherMutation.mutate(formData);
    } else {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) showToast(firstError, 'error', 4);
    }
  };

  const handleReset = () => {
    setFormData({ teacher_name: '', teacher_code: '' });
    setErrors({});
    setSuccessMessage('');
    showToast('Form cleared', 'info', 3);
  };

  const isSubmitting = addTeacherMutation.isPending;

  return (
    <div className="teacher-form-wrapper">
      <div className="teacher-form-container">
        {/* Success Message */}
        {successMessage && (
          <div className="teacher-form-success">
            <span className="teacher-success-icon">✓</span>
            {successMessage}
          </div>
        )}

        <form className="teacher-form" onSubmit={handleSubmit}>
          {/* Teacher Name Input */}
          <div className="teacher-form-group">
            <label className="teacher-form-label">
              Teacher Name <span className="teacher-required">*</span>
            </label>
            <input
              type="text"
              name="teacher_name"
              value={formData.teacher_name}
              onChange={handleInputChange}
              className={`teacher-form-input ${errors.teacher_name ? 'teacher-input-error' : ''}`}
              placeholder="e.g., John Doe, Jane Smith"
              disabled={isSubmitting}
              autoComplete="off"
              maxLength={100}
            />
            {errors.teacher_name && (
              <div className="teacher-error-message">{errors.teacher_name}</div>
            )}
            <div className="teacher-hint">
              Enter the full teacher name (max 100 characters)
            </div>
          </div>

          {/* Teacher Code Input */}
          <div className="teacher-form-group">
            <label className="teacher-form-label">
              Teacher Code <span className="teacher-required">*</span>
            </label>
            <input
              type="text"
              name="teacher_code"
              value={formData.teacher_code}
              onChange={handleInputChange}
              className={`teacher-form-input ${errors.teacher_code ? 'teacher-input-error' : ''}`}
              placeholder="e.g., JD01, SMITH, TEACH001"
              disabled={isSubmitting}
              autoComplete="off"
              maxLength={20}
            />
            {errors.teacher_code && (
              <div className="teacher-error-message">{errors.teacher_code}</div>
            )}
            <div className="teacher-hint">
              Use uppercase letters and numbers only (max 20 characters)
            </div>
          </div>

          {/* Teacher Preview */}
          {(formData.teacher_name || formData.teacher_code) && (
            <div className="teacher-form-group">
              <div className="teacher-preview">
                <div className="teacher-preview-label">Teacher Preview:</div>
                <div className="teacher-preview-value">
                  {formData.teacher_name || 'Teacher Name'} ({formData.teacher_code || 'CODE'})
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="teacher-form-actions">
            <button
              type="button"
              className="teacher-btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear
            </button>
            <button
              type="submit"
              className="teacher-btn-primary"
              disabled={isSubmitting || !formData.teacher_name || !formData.teacher_code}
            >
              {isSubmitting ? (
                <>
                  <span className="teacher-loading-spinner"></span>
                  Adding...
                </>
              ) : (
                'Add Teacher'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeacherComponent;