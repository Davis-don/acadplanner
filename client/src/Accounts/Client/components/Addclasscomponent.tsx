import './addclasscomponent.css';
import { useState, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

interface FormData {
  class_name: string;
  stream: string;
}

interface Errors {
  class_name?: string;
  stream?: string;
}

interface SchoolClassResponse {
  message: string;
  class: {
    class_id: string;
    class_name: string;
    stream: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
}

interface ApiError {
  [key: string]: string[];
}

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

function Addclasscomponent() {
  const [formData, setFormData] = useState<FormData>({
    class_name: '',
    stream: '',
  });
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumType | ''>('');
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { showToast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const availableStreams = useMemo(() => {
    if (!selectedCurriculum || !CURRICULUM_GROUPS[selectedCurriculum]) {
      return [];
    }
    return CURRICULUM_GROUPS[selectedCurriculum].streams;
  }, [selectedCurriculum]);

  const addClassMutation = useMutation<
    SchoolClassResponse,
    ApiError,
    FormData
  >({
    mutationFn: async (classData) => {
      const response = await fetch(`${apiUrl}/classes/new_class/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(classData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw { non_field_errors: ['Please log in to create a class'] };
        }
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Creating new class...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message, 'success', 4);
      setSuccessMessage(`Class "${data.class.class_name} (${data.class.stream})" created successfully!`);
      
      setFormData({ class_name: '', stream: '' });
      setSelectedCurriculum('');
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
          showToast('Failed to create class. Please check your information.', 'error', 5);
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  const handleCurriculumSelect = (curriculum: CurriculumType) => {
    setSelectedCurriculum(curriculum);
    setFormData(prev => ({ ...prev, stream: '' }));
    if (errors.stream) setErrors(prev => ({ ...prev, stream: undefined }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    if (successMessage) setSuccessMessage('');
  };

  const handleStreamSelect = (stream: string) => {
    setFormData(prev => ({ ...prev, stream }));
    if (errors.stream) setErrors(prev => ({ ...prev, stream: undefined }));
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.stream.trim()) newErrors.stream = 'Please select a grade/stream';
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      addClassMutation.mutate(formData);
    } else {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) showToast(firstError, 'error', 4);
    }
  };

  const handleReset = () => {
    setFormData({ class_name: '', stream: '' });
    setSelectedCurriculum('');
    setErrors({});
    setSuccessMessage('');
    showToast('Form cleared', 'info', 3);
  };

  const isSubmitting = addClassMutation.isPending;

  return (
    <div className="class-form-wrapper">
      <div className="class-form-container">
        {/* Success Message */}
        {successMessage && (
          <div className="form-success">
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        <form className="class-form" onSubmit={handleSubmit}>
          {/* Class Name Input */}
          <div className="form-group">
            <label className="form-label">
              Class Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleInputChange}
              className={`form-input ${errors.class_name ? 'input-error' : ''}`}
              placeholder="e.g., West, North, Red House"
              disabled={isSubmitting}
              autoComplete="off"
            />
            {errors.class_name && (
              <div className="error-message">{errors.class_name}</div>
            )}
          </div>

          {/* Curriculum Selection */}
          <div className="form-group">
            <label className="form-label">
              Curriculum System <span className="required">*</span>
            </label>
            <div className="curriculum-options">
              {Object.entries(CURRICULUM_GROUPS).map(([key, curriculum]) => (
                <button
                  key={key}
                  type="button"
                  className={`curriculum-btn ${selectedCurriculum === key ? 'curriculum-selected' : ''}`}
                  onClick={() => handleCurriculumSelect(key as CurriculumType)}
                  disabled={isSubmitting}
                >
                  {curriculum.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Selection */}
          {selectedCurriculum && (
            <div className="form-group">
              <label className="form-label">
                Grade/Stream <span className="required">*</span>
              </label>
              <div className="stream-grid">
                {availableStreams.map((stream) => (
                  <button
                    key={stream}
                    type="button"
                    className={`stream-btn ${formData.stream === stream ? 'stream-selected' : ''}`}
                    onClick={() => handleStreamSelect(stream)}
                    disabled={isSubmitting}
                  >
                    {stream}
                  </button>
                ))}
              </div>
              {errors.stream && (
                <div className="error-message">{errors.stream}</div>
              )}
            </div>
          )}

          {/* Class Preview */}
          {(formData.class_name || formData.stream) && (
            <div className="form-group">
              <div className="class-preview">
                <div className="preview-label">Class Preview:</div>
                <div className="preview-value">
                  {formData.class_name || 'Class Name'} ({formData.stream || 'Grade/Stream'})
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.class_name || !formData.stream}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating...
                </>
              ) : (
                'Create Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Addclasscomponent;