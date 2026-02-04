import './addsubjectcomponent.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface FormData {
  subject_name: string;
  subject_code: string;
}

interface Errors {
  subject_name?: string;
  subject_code?: string;
}

interface SubjectResponse {
  message: string;
  subject: {
    subject_id: string;
    subject_name: string;
    subject_code: string;
    created_at: string;
    updated_at: string;
  };
}

interface ApiError {
  [key: string]: string[];
}

function Addsubjectcomponent() {
  const [formData, setFormData] = useState<FormData>({
    subject_name: '',
    subject_code: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { showToast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const addSubjectMutation = useMutation<
    SubjectResponse,
    ApiError,
    FormData
  >({
    mutationFn: async (subjectData) => {
      const response = await fetch(`${apiUrl}/subjects/new_subject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subjectData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw { non_field_errors: ['Please log in to add a subject'] };
        }
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Adding new subject...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message, 'success', 4);
      setSuccessMessage(`Subject "${data.subject.subject_name} (${data.subject.subject_code})" added successfully!`);
      
      setFormData({ subject_name: '', subject_code: '' });
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
          showToast('Failed to add subject. Please check your information.', 'error', 5);
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    
    // Auto-uppercase for subject code
    const processedValue = key === 'subject_code' ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [key]: processedValue }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    
    if (!formData.subject_name.trim()) {
      newErrors.subject_name = 'Subject name is required';
    } else if (formData.subject_name.length > 100) {
      newErrors.subject_name = 'Subject name cannot exceed 100 characters';
    }
    
    if (!formData.subject_code.trim()) {
      newErrors.subject_code = 'Subject code is required';
    } else if (formData.subject_code.length > 20) {
      newErrors.subject_code = 'Subject code cannot exceed 20 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.subject_code)) {
      newErrors.subject_code = 'Subject code can only contain uppercase letters and numbers';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      addSubjectMutation.mutate(formData);
    } else {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) showToast(firstError, 'error', 4);
    }
  };

  const handleReset = () => {
    setFormData({ subject_name: '', subject_code: '' });
    setErrors({});
    setSuccessMessage('');
    showToast('Form cleared', 'info', 3);
  };

  const isSubmitting = addSubjectMutation.isPending;

  return (
    <div className="subject-form-wrapper">
      <div className="subject-form-container">
        {/* Success Message */}
        {successMessage && (
          <div className="subject-form-success">
            <span className="subject-success-icon">✓</span>
            {successMessage}
          </div>
        )}

        <form className="subject-form" onSubmit={handleSubmit}>
          {/* Subject Name Input */}
          <div className="subject-form-group">
            <label className="subject-form-label">
              Subject Name <span className="subject-required">*</span>
            </label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleInputChange}
              className={`subject-form-input ${errors.subject_name ? 'subject-input-error' : ''}`}
              placeholder="e.g., Mathematics, Physics, English"
              disabled={isSubmitting}
              autoComplete="off"
              maxLength={100}
            />
            {errors.subject_name && (
              <div className="subject-error-message">{errors.subject_name}</div>
            )}
            <div className="subject-hint">
              Enter the full subject name (max 100 characters)
            </div>
          </div>

          {/* Subject Code Input */}
          <div className="subject-form-group">
            <label className="subject-form-label">
              Subject Code <span className="subject-required">*</span>
            </label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleInputChange}
              className={`subject-form-input ${errors.subject_code ? 'subject-input-error' : ''}`}
              placeholder="e.g., MATH, PHY, ENG"
              disabled={isSubmitting}
              autoComplete="off"
              maxLength={20}
            />
            {errors.subject_code && (
              <div className="subject-error-message">{errors.subject_code}</div>
            )}
            <div className="subject-hint">
              Use uppercase letters and numbers only (max 20 characters)
            </div>
          </div>

          {/* Subject Preview */}
          {(formData.subject_name || formData.subject_code) && (
            <div className="subject-form-group">
              <div className="subject-preview">
                <div className="subject-preview-label">Subject Preview:</div>
                <div className="subject-preview-value">
                  {formData.subject_name || 'Subject Name'} ({formData.subject_code || 'CODE'})
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="subject-form-actions">
            <button
              type="button"
              className="subject-btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear
            </button>
            <button
              type="submit"
              className="subject-btn-primary"
              disabled={isSubmitting || !formData.subject_name || !formData.subject_code}
            >
              {isSubmitting ? (
                <>
                  <span className="subject-loading-spinner"></span>
                  Adding...
                </>
              ) : (
                'Add Subject'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Addsubjectcomponent;