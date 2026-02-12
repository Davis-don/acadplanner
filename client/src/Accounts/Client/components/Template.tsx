import './template.css';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Break {
  break_name: string;
  duration_minutes: number;
  position: number;
}

interface TimetableTemplateData {
  name: string;
  description: string;
  day_start_time: string;
  lesson_duration_minutes: number;
  lessons_per_day: number;
  active_days: string[];
  breaks: Break[];
}

interface TimetableTemplateResponse {
  message: string;
  data: {
    template_id: string;
    name: string;
    description: string;
    day_start_time: string;
    lesson_duration_minutes: number;
    lessons_per_day: number;
    active_days: string[];
    breaks: Break[];
    created_at: string;
  };
}

interface ApiError {
  error?: string;
  [key: string]: string | string[] | undefined;
}

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function Template() {
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [formData, setFormData] = useState<TimetableTemplateData>({
    name: '',
    description: '',
    day_start_time: '08:00',
    lesson_duration_minutes: 40,
    lessons_per_day: 8,
    active_days: [],
    breaks: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // ==========================================
  // MUTATION - CREATE TIMETABLE TEMPLATE
  // ==========================================

  const createTemplateMutation = useMutation<
    TimetableTemplateResponse,
    ApiError,
    TimetableTemplateData
  >({
    mutationFn: async (templateData) => {
      const response = await fetch(`${apiUrl}/timetables/create-template/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(templateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw { non_field_errors: ['Please log in to create a timetable template'] };
        }
        throw result;
      }

      return result;
    },

    onMutate: () => {
      setServerError(null);
      showToast('Creating timetable template...', 'info', 3);
    },

    onSuccess: (data) => {
      // Show success message from server
      showToast(data.message || 'Template created successfully!', 'success', 4);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        day_start_time: '08:00',
        lesson_duration_minutes: 40,
        lessons_per_day: 8,
        active_days: [],
        breaks: [],
      });
      setErrors({});
      setServerError(null);
    },

    onError: (error) => {
      if (typeof error === 'object') {
        // Check for custom error message from server (like "You already have a template")
        if (error.error) {
          const errorMessage = error.error as string;
          setServerError(errorMessage);
          showToast(errorMessage, 'error', 6);
          return;
        }

        if (error.non_field_errors) {
          const errorMessage = Array.isArray(error.non_field_errors) 
            ? error.non_field_errors[0] 
            : 'Validation error occurred';
          setServerError(errorMessage);
          showToast(errorMessage, 'error', 5);
          return;
        }

        // Handle field errors
        const fieldErrors: { [key: string]: string } = {};
        Object.keys(error).forEach(key => {
          if (error[key] && Array.isArray(error[key]) && error[key].length > 0) {
            fieldErrors[key] = error[key][0];
          }
        });
        setErrors(fieldErrors);

        // Show first field error in toast
        const firstErrorKey = Object.keys(error)[0];
        if (firstErrorKey && error[firstErrorKey]?.[0]) {
          showToast(`${firstErrorKey}: ${error[firstErrorKey][0]}`, 'error', 5);
        } else if (!error.error) {
          showToast('Failed to create template. Please check your information.', 'error', 5);
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error', 5);
      }
    },
  });

  // ==========================================
  // HANDLERS - MAIN FORM
  // ==========================================

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError(null);
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setFormData(prev => ({ ...prev, [name]: numValue }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear server error
    if (serverError) {
      setServerError(null);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const isSelected = prev.active_days.includes(day);
      const newDays = isSelected
        ? prev.active_days.filter(d => d !== day)
        : [...prev.active_days, day];
      
      return { ...prev, active_days: newDays };
    });

    if (errors.active_days) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.active_days;
        return newErrors;
      });
    }
    
    // Clear server error
    if (serverError) {
      setServerError(null);
    }
  };

  // ==========================================
  // HANDLERS - BREAKS
  // ==========================================

  const addBreak = () => {
    const newBreak: Break = {
      break_name: `Break ${formData.breaks.length + 1}`,
      duration_minutes: 15,
      position: Math.min(formData.breaks.length + 3, formData.lessons_per_day),
    };

    setFormData(prev => ({
      ...prev,
      breaks: [...prev.breaks, newBreak].sort((a, b) => a.position - b.position)
    }));
    
    // Clear server error
    if (serverError) {
      setServerError(null);
    }
  };

  const removeBreak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }));
  };

  const updateBreak = (index: number, field: keyof Break, value: string | number) => {
    setFormData(prev => {
      const updatedBreaks = [...prev.breaks];
      
      if (field === 'position') {
        const position = Number(value);
        updatedBreaks[index] = { ...updatedBreaks[index], position };
        // Sort by position after update
        updatedBreaks.sort((a, b) => a.position - b.position);
      } else if (field === 'duration_minutes') {
        updatedBreaks[index] = { ...updatedBreaks[index], duration_minutes: Number(value) };
      } else if (field === 'break_name') {
        updatedBreaks[index] = { ...updatedBreaks[index], break_name: String(value) };
      }
      
      return { ...prev, breaks: updatedBreaks };
    });
  };

  // ==========================================
  // FORM VALIDATION & SUBMIT
  // ==========================================

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.day_start_time) {
      newErrors.day_start_time = 'Start time is required';
    }

    if (formData.lesson_duration_minutes < 1) {
      newErrors.lesson_duration_minutes = 'Lesson duration must be at least 1 minute';
    }

    if (formData.lessons_per_day < 1) {
      newErrors.lessons_per_day = 'At least 1 lesson per day is required';
    }

    if (formData.active_days.length === 0) {
      newErrors.active_days = 'Select at least one active day';
    }

    // Validate breaks
    formData.breaks.forEach((breakItem, index) => {
      if (breakItem.position > formData.lessons_per_day) {
        newErrors[`break_${index}`] = `Break position ${breakItem.position} exceeds lessons per day`;
      }
      if (!breakItem.break_name.trim()) {
        newErrors[`break_name_${index}`] = 'Break name is required';
      }
      if (breakItem.duration_minutes < 1) {
        newErrors[`break_duration_${index}`] = 'Duration must be at least 1 minute';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    
    if (validateForm()) {
      createTemplateMutation.mutate(formData);
    } else {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        showToast(firstError, 'error', 4);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      day_start_time: '08:00',
      lesson_duration_minutes: 40,
      lessons_per_day: 8,
      active_days: [],
      breaks: [],
    });
    setErrors({});
    setServerError(null);
    showToast('Form cleared', 'info', 3);
  };

  const isSubmitting = createTemplateMutation.isPending;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="template-creator-wrapper">
      <div className="template-creator-container">
        
        {/* Header */}
        <div className="template-header">
          <h1 className="template-title">
            <span className="template-title-icon">📅</span>
            Create Timetable Template
          </h1>
          <p className="template-subtitle">
            Define the structure of your timetable - lesson duration, breaks, and active days
          </p>
        </div>

        {/* Server Error Banner - Displays messages from backend */}
        {serverError && (
          <div className="server-error-banner">
            <span className="server-error-icon">⚠️</span>
            <div className="server-error-content">
              <div className="server-error-title">Unable to create template</div>
              <div className="server-error-message">{serverError}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="template-form" onSubmit={handleSubmit}>
          
          {/* SECTION 1: Basic Information */}
          <div className="template-section">
            <h2 className="section-title">
              <span className="section-number">1</span>
              Basic Information
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Template Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Secondary School Schedule"
                  disabled={isSubmitting}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Optional description"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Schedule Configuration */}
          <div className="template-section">
            <h2 className="section-title">
              <span className="section-number">2</span>
              Schedule Configuration
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Day Start Time <span className="required-star">*</span>
                </label>
                <input
                  type="time"
                  name="day_start_time"
                  value={formData.day_start_time}
                  onChange={handleInputChange}
                  className={`form-input time-input ${errors.day_start_time ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.day_start_time && <div className="error-message">{errors.day_start_time}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lesson Duration (minutes) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="lesson_duration_minutes"
                  value={formData.lesson_duration_minutes}
                  onChange={handleNumberChange}
                  className={`form-input ${errors.lesson_duration_minutes ? 'error' : ''}`}
                  min="1"
                  max="180"
                  disabled={isSubmitting}
                />
                {errors.lesson_duration_minutes && (
                  <div className="error-message">{errors.lesson_duration_minutes}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lessons Per Day <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="lessons_per_day"
                  value={formData.lessons_per_day}
                  onChange={handleNumberChange}
                  className={`form-input ${errors.lessons_per_day ? 'error' : ''}`}
                  min="1"
                  max="16"
                  disabled={isSubmitting}
                />
                {errors.lessons_per_day && (
                  <div className="error-message">{errors.lessons_per_day}</div>
                )}
              </div>
            </div>

            {/* Active Days */}
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="form-label">
                Active Days <span className="required-star">*</span>
              </label>
              <div className="days-grid">
                {VALID_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`day-btn ${formData.active_days.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleDayToggle(day)}
                    disabled={isSubmitting}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {errors.active_days && <div className="error-message">{errors.active_days}</div>}
            </div>
          </div>

          {/* SECTION 3: Breaks - COLORFUL SECTION */}
          <div className="breaks-section">
            <div className="breaks-header">
              <h2 className="breaks-title">
                <span className="breaks-icon">☕</span>
                Break Times
              </h2>
              <button
                type="button"
                className="add-break-btn"
                onClick={addBreak}
                disabled={isSubmitting || formData.breaks.length >= 5}
              >
                <span>+</span> Add Break
              </button>
            </div>

            {formData.breaks.length === 0 ? (
              <div className="no-breaks">
                <div className="no-breaks-icon">⏸️</div>
                <div className="no-breaks-text">No breaks added yet</div>
                <p style={{ color: '#b45309', marginTop: '8px', fontSize: '14px' }}>
                  Click "Add Break" to schedule breaks between lessons
                </p>
              </div>
            ) : (
              <div className="breaks-grid">
                {formData.breaks.map((breakItem, index) => (
                  <div key={index} className="break-card">
                    <div className="break-card-header">
                      <div className="break-card-title">
                        <span>⏳</span>
                        {breakItem.break_name}
                      </div>
                      <div className="break-badge">
                        After Lesson {breakItem.position}
                      </div>
                      <button
                        type="button"
                        className="remove-break-btn"
                        onClick={() => removeBreak(index)}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>

                    <div className="break-fields">
                      <div className="break-input-group">
                        <label className="break-input-label">Break Name</label>
                        <input
                          type="text"
                          value={breakItem.break_name}
                          onChange={(e) => updateBreak(index, 'break_name', e.target.value)}
                          className="break-input"
                          placeholder="e.g., Lunch"
                          disabled={isSubmitting}
                        />
                        {errors[`break_name_${index}`] && (
                          <div className="error-message">{errors[`break_name_${index}`]}</div>
                        )}
                      </div>

                      <div className="break-input-group">
                        <label className="break-input-label">Duration (min)</label>
                        <input
                          type="number"
                          value={breakItem.duration_minutes}
                          onChange={(e) => updateBreak(index, 'duration_minutes', e.target.value)}
                          className="break-input"
                          min="1"
                          max="120"
                          disabled={isSubmitting}
                        />
                        {errors[`break_duration_${index}`] && (
                          <div className="error-message">{errors[`break_duration_${index}`]}</div>
                        )}
                      </div>

                      <div className="break-input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="break-input-label">Position (after lesson #)</label>
                        <input
                          type="number"
                          value={breakItem.position}
                          onChange={(e) => updateBreak(index, 'position', e.target.value)}
                          className="break-input"
                          min="1"
                          max={formData.lessons_per_day}
                          disabled={isSubmitting}
                        />
                        {breakItem.position > formData.lessons_per_day && (
                          <div className="break-position-hint">
                            ⚠️ Exceeds lessons per day
                          </div>
                        )}
                        {errors[`break_${index}`] && (
                          <div className="error-message">{errors[`break_${index}`]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear All
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !formData.name || !formData.active_days.length}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  ✨ Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Template;