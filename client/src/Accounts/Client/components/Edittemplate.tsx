import './edittemplate.css';
import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  data: TimetableTemplateData & {
    template_id: string;
    created_at: string;
  };
}

interface FetchTemplateResponse {
  message: string;
  data: (TimetableTemplateData & {
    template_id: string;
    created_at: string;
  }) | null;
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

function EditTemplate() {
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
  const [hasChanges, setHasChanges] = useState(false);

  // ==========================================
  // QUERY - FETCH EXISTING TEMPLATE
  // ==========================================

  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    refetch: refetchTemplate
  } = useQuery<FetchTemplateResponse>({
    queryKey: ['timetable-template'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/timetables/get-template/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw result;
      }

      return result;
    },
  });

  // ==========================================
  // MUTATION - UPDATE TEMPLATE
  // ==========================================

  const updateTemplateMutation = useMutation<
    TimetableTemplateResponse,
    any,
    TimetableTemplateData
  >({
    mutationFn: async (templateData) => {
      const response = await fetch(`${apiUrl}/timetables/update-template/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(templateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      return result;
    },

    onMutate: () => {
      showToast('Updating template...', 'info', 3);
    },

    onSuccess: (data) => {
      showToast(data.message || 'Template updated successfully!', 'success', 4);
      setHasChanges(false);
      
      // Refresh template data
      refetchTemplate();
    },

    onError: (error) => {
      if (error.error) {
        showToast(error.error, 'error', 6);
      } else if (error.non_field_errors) {
        showToast(error.non_field_errors[0], 'error', 5);
      } else {
        showToast('Failed to update template', 'error', 5);
      }
    },
  });

  // ==========================================
  // EFFECT - POPULATE FORM WITH FETCHED DATA
  // ==========================================

  useEffect(() => {
    if (templateData?.data) {
      setFormData({
        name: templateData.data.name || '',
        description: templateData.data.description || '',
        day_start_time: templateData.data.day_start_time || '08:00',
        lesson_duration_minutes: templateData.data.lesson_duration_minutes || 40,
        lessons_per_day: templateData.data.lessons_per_day || 8,
        active_days: templateData.data.active_days || [],
        breaks: templateData.data.breaks || [],
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [templateData]);

  // ==========================================
  // HANDLERS - MAIN FORM
  // ==========================================

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setFormData(prev => ({ ...prev, [name]: numValue }));
    setHasChanges(true);
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    setHasChanges(true);

    if (errors.active_days) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.active_days;
        return newErrors;
      });
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
    setHasChanges(true);
  };

  const removeBreak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const updateBreak = (index: number, field: keyof Break, value: string | number) => {
    setFormData(prev => {
      const updatedBreaks = [...prev.breaks];
      
      if (field === 'position') {
        const position = Number(value);
        updatedBreaks[index] = { ...updatedBreaks[index], position };
        updatedBreaks.sort((a, b) => a.position - b.position);
      } else if (field === 'duration_minutes') {
        updatedBreaks[index] = { ...updatedBreaks[index], duration_minutes: Number(value) };
      } else if (field === 'break_name') {
        updatedBreaks[index] = { ...updatedBreaks[index], break_name: String(value) };
      }
      
      return { ...prev, breaks: updatedBreaks };
    });
    setHasChanges(true);
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

    formData.breaks.forEach((breakItem, index) => {
      if (breakItem.position > formData.lessons_per_day) {
        newErrors[`break_${index}`] = `Break position exceeds lessons per day`;
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
    
    if (!hasChanges) {
      showToast('No changes to save', 'info', 3);
      return;
    }
    
    if (validateForm()) {
      updateTemplateMutation.mutate(formData);
    } else {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        showToast(firstError, 'error', 4);
      }
    }
  };

  const handleReset = () => {
    if (templateData?.data) {
      setFormData({
        name: templateData.data.name || '',
        description: templateData.data.description || '',
        day_start_time: templateData.data.day_start_time || '08:00',
        lesson_duration_minutes: templateData.data.lesson_duration_minutes || 40,
        lessons_per_day: templateData.data.lessons_per_day || 8,
        active_days: templateData.data.active_days || [],
        breaks: templateData.data.breaks || [],
      });
      setHasChanges(false);
      setErrors({});
      showToast('Changes discarded', 'info', 3);
    }
  };

  const isSubmitting = updateTemplateMutation.isPending;

  // ==========================================
  // RENDER STATES
  // ==========================================

  if (isLoadingTemplate) {
    return (
      <div className="edit-template-loading">
        <div className="edit-template-loading-spinner"></div>
        <p>Loading your template...</p>
      </div>
    );
  }

  if (!templateData?.data) {
    return (
      <div className="edit-template-empty">
        <div className="edit-template-empty-icon">📭</div>
        <h3 className="edit-template-empty-title">No Template Found</h3>
        <p className="edit-template-empty-text">
          You haven't created a timetable template yet. Create one first to edit it.
        </p>
        <button 
          className="edit-template-empty-btn"
          onClick={() => window.location.href = '/timetables/new'}
        >
          <span>✨</span>
          Create New Template
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="edit-template-wrapper">
      <div className="edit-template-container">
        
        {/* Header with Status */}
        <div className="edit-template-header">
          <div className="edit-template-title-area">
            <h1 className="edit-template-title">
              <span className="edit-template-title-icon">✏️</span>
              Edit Timetable Template
            </h1>
            <div className="edit-template-badge">
              <span className="edit-template-badge-dot"></span>
              Editing: <strong>{formData.name || 'Untitled'}</strong>
            </div>
          </div>
          <p className="edit-template-subtitle">
            Modify your existing timetable structure - changes will be saved immediately
          </p>
        </div>

        {/* Unsaved Changes Banner */}
        {hasChanges && (
          <div className="edit-template-changes-banner">
            <span className="edit-template-changes-icon">📝</span>
            <span className="edit-template-changes-text">
              You have unsaved changes
            </span>
          </div>
        )}

        {/* Form */}
        <form className="edit-template-form" onSubmit={handleSubmit}>
          
          {/* SECTION 1: Basic Information */}
          <div className="edit-template-section">
            <div className="edit-template-section-header">
              <span className="edit-template-section-icon">📋</span>
              <h2 className="edit-template-section-title">Basic Information</h2>
            </div>
            
            <div className="edit-template-grid">
              <div className="edit-template-field">
                <label className="edit-template-label">
                  Template Name <span className="edit-template-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`edit-template-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Secondary School Schedule"
                  disabled={isSubmitting}
                />
                {errors.name && <div className="edit-template-error">{errors.name}</div>}
              </div>

              <div className="edit-template-field">
                <label className="edit-template-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="edit-template-input"
                  placeholder="Optional description"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Schedule Configuration */}
          <div className="edit-template-section">
            <div className="edit-template-section-header">
              <span className="edit-template-section-icon">⚙️</span>
              <h2 className="edit-template-section-title">Schedule Configuration</h2>
            </div>
            
            <div className="edit-template-grid">
              <div className="edit-template-field">
                <label className="edit-template-label">
                  Day Start Time <span className="edit-template-required">*</span>
                </label>
                <input
                  type="time"
                  name="day_start_time"
                  value={formData.day_start_time}
                  onChange={handleInputChange}
                  className={`edit-template-input edit-template-time-input ${errors.day_start_time ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.day_start_time && <div className="edit-template-error">{errors.day_start_time}</div>}
              </div>

              <div className="edit-template-field">
                <label className="edit-template-label">
                  Lesson Duration <span className="edit-template-required">*</span>
                </label>
                <div className="edit-template-input-group">
                  <input
                    type="number"
                    name="lesson_duration_minutes"
                    value={formData.lesson_duration_minutes}
                    onChange={handleNumberChange}
                    className={`edit-template-input ${errors.lesson_duration_minutes ? 'error' : ''}`}
                    min="1"
                    max="180"
                    disabled={isSubmitting}
                  />
                  <span className="edit-template-input-suffix">minutes</span>
                </div>
                {errors.lesson_duration_minutes && (
                  <div className="edit-template-error">{errors.lesson_duration_minutes}</div>
                )}
              </div>

              <div className="edit-template-field">
                <label className="edit-template-label">
                  Lessons Per Day <span className="edit-template-required">*</span>
                </label>
                <input
                  type="number"
                  name="lessons_per_day"
                  value={formData.lessons_per_day}
                  onChange={handleNumberChange}
                  className={`edit-template-input ${errors.lessons_per_day ? 'error' : ''}`}
                  min="1"
                  max="16"
                  disabled={isSubmitting}
                />
                {errors.lessons_per_day && (
                  <div className="edit-template-error">{errors.lessons_per_day}</div>
                )}
              </div>
            </div>

            {/* Active Days */}
            <div className="edit-template-days-section">
              <label className="edit-template-label">
                Active Days <span className="edit-template-required">*</span>
              </label>
              <div className="edit-template-days-grid">
                {VALID_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`edit-template-day-btn ${formData.active_days.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleDayToggle(day)}
                    disabled={isSubmitting}
                  >
                    <span className="edit-template-day-name">{day.slice(0, 3)}</span>
                    {formData.active_days.includes(day) && (
                      <span className="edit-template-day-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {errors.active_days && <div className="edit-template-error">{errors.active_days}</div>}
            </div>
          </div>

          {/* SECTION 3: Breaks Management */}
          <div className="edit-template-breaks-section">
            <div className="edit-template-breaks-header">
              <div className="edit-template-section-header">
                <span className="edit-template-section-icon">☕</span>
                <h2 className="edit-template-section-title">Break Management</h2>
              </div>
              <button
                type="button"
                className="edit-template-add-break-btn"
                onClick={addBreak}
                disabled={isSubmitting || formData.breaks.length >= 6}
              >
                <span className="edit-template-add-break-icon">+</span>
                Add Break
              </button>
            </div>

            {formData.breaks.length === 0 ? (
              <div className="edit-template-no-breaks">
                <div className="edit-template-no-breaks-icon">⏳</div>
                <div className="edit-template-no-breaks-title">No breaks scheduled</div>
                <p className="edit-template-no-breaks-text">
                  Click "Add Break" to schedule breaks between lessons
                </p>
              </div>
            ) : (
              <div className="edit-template-breaks-container">
                {formData.breaks.map((breakItem, index) => (
                  <div key={index} className="edit-template-break-card">
                    <div className="edit-template-break-card-header">
                      <div className="edit-template-break-card-title">
                        <span className="edit-template-break-icon">⏱️</span>
                        <input
                          type="text"
                          value={breakItem.break_name}
                          onChange={(e) => updateBreak(index, 'break_name', e.target.value)}
                          className="edit-template-break-name-input"
                          placeholder="Break name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="edit-template-break-position">
                        <span className="edit-template-break-position-label">After</span>
                        <input
                          type="number"
                          value={breakItem.position}
                          onChange={(e) => updateBreak(index, 'position', e.target.value)}
                          className="edit-template-break-position-input"
                          min="1"
                          max={formData.lessons_per_day}
                          disabled={isSubmitting}
                        />
                        <span className="edit-template-break-position-suffix">lesson</span>
                      </div>
                      <button
                        type="button"
                        className="edit-template-remove-break-btn"
                        onClick={() => removeBreak(index)}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>

                    <div className="edit-template-break-duration">
                      <span className="edit-template-break-duration-label">Duration</span>
                      <div className="edit-template-break-duration-input-group">
                        <input
                          type="number"
                          value={breakItem.duration_minutes}
                          onChange={(e) => updateBreak(index, 'duration_minutes', e.target.value)}
                          className="edit-template-break-duration-input"
                          min="1"
                          max="120"
                          disabled={isSubmitting}
                        />
                        <span className="edit-template-break-duration-suffix">minutes</span>
                      </div>
                    </div>

                    {breakItem.position > formData.lessons_per_day && (
                      <div className="edit-template-break-warning">
                        ⚠️ Position exceeds lessons per day
                      </div>
                    )}
                    {errors[`break_name_${index}`] && (
                      <div className="edit-template-error">{errors[`break_name_${index}`]}</div>
                    )}
                    {errors[`break_duration_${index}`] && (
                      <div className="edit-template-error">{errors[`break_duration_${index}`]}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="edit-template-breaks-hint">
              <span className="edit-template-breaks-hint-icon">💡</span>
              <span>Breaks are automatically sorted by position</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="edit-template-actions">
            <button
              type="button"
              className="edit-template-btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting || !hasChanges}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="edit-template-btn-primary"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <span className="edit-template-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTemplate;