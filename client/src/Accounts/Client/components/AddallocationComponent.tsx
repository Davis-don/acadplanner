import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';
import AllocationTeacherFetch from './AllocationTeacherFetch';
import AllocationSubjectFetch from './AllocationSubjectFetch';
import AllocationClassFetch from './AllocationClassFetch';
import './addallocationcomponent.css';

interface Teacher {
  teacher_id: string;
  full_name: string;
  teacher_name?: string;
  teacher_code?: string;
  created_at?: string;
  updated_at?: string;
}

interface Subject {
  subject_id: string;
  name: string;
  subject_name?: string;
  subject_code?: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolClass {
  class_id: string;
  name: string;
  class_name?: string;
  stream?: string;
  academic_year?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

interface AllocationData {
  teacher: Teacher | null;
  subject: Subject | null;
  schoolClass: SchoolClass | null;
  numberOfLessons: number;
}

const apiUrl = import.meta.env.VITE_API_URL

// Helper function to get CSRF token
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function createAllocation(allocationData: AllocationData) {
  console.log('Sending allocation data:', allocationData);
  
  // Create request body with proper foreign key references
  const requestBody = {
    teacher: allocationData.teacher?.teacher_id,  // Foreign key reference
    subject: allocationData.subject?.subject_id,  // Foreign key reference
    school_class: allocationData.schoolClass?.class_id,  // Foreign key reference (note: snake_case)
    number_of_lessons: allocationData.numberOfLessons,
  };

  console.log('Request body:', requestBody);

  const response = await fetch(`${apiUrl}/allocations/new_allocation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    let errorMessage = 'Failed to create allocation';
    try {
      const errorData = await response.json();
      console.log('Error response:', errorData);
      
      // Handle Django serializer errors
      if (typeof errorData === 'object') {
        // Check for field-specific errors
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        
        errorMessage = fieldErrors || JSON.stringify(errorData);
      } else {
        errorMessage = errorData.message || errorData.error || String(errorData);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export default function AddAllocationComponent() {
  const [step, setStep] = useState(1);
  const [allocation, setAllocation] = useState<AllocationData>({
    teacher: null,
    subject: null,
    schoolClass: null,
    numberOfLessons: 1,
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      showToast(data.message || 'Allocation created successfully!', 'success', 4);
      resetForm();
    },
    onError: (error: Error) => {
      console.error('Allocation error:', error);
      showToast(error.message, 'error', 5);
    },
  });

  const handleTeacherSelect = (teacher: any) => {
    // Ensure teacher has required fields
    const selectedTeacher: Teacher = {
      teacher_id: teacher.teacher_id,
      full_name: teacher.full_name || teacher.teacher_name || 'Unknown Teacher',
      teacher_name: teacher.teacher_name,
      teacher_code: teacher.teacher_code,
    };
    setAllocation(prev => ({ ...prev, teacher: selectedTeacher }));
    setStep(2);
  };

  const handleSubjectSelect = (subject: any) => {
    // Ensure subject has required fields
    const selectedSubject: Subject = {
      subject_id: subject.subject_id,
      name: subject.name || subject.subject_name || 'Unknown Subject',
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
    };
    setAllocation(prev => ({ ...prev, subject: selectedSubject }));
    setStep(3);
  };

  const handleClassSelect = (schoolClass: any) => {
    // Ensure class has required fields
    const selectedClass: SchoolClass = {
      class_id: schoolClass.class_id,
      name: schoolClass.name || schoolClass.class_name || 'Unknown Class',
      class_name: schoolClass.class_name,
      stream: schoolClass.stream,
    };
    setAllocation(prev => ({ ...prev, schoolClass: selectedClass }));
    setStep(4);
  };

  const handleNumberOfLessonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAllocation(prev => ({ 
      ...prev, 
      numberOfLessons: isNaN(value) || value < 1 ? 1 : Math.min(40, value)
    }));
  };

  const handleSubmit = () => {
    if (!allocation.teacher) {
      showToast('Please select a teacher', 'error', 4);
      return;
    }
    if (!allocation.subject) {
      showToast('Please select a subject', 'error', 4);
      return;
    }
    if (!allocation.schoolClass) {
      showToast('Please select a class', 'error', 4);
      return;
    }

    console.log('Submitting allocation:', allocation);
    mutation.mutate(allocation);
  };

  const resetForm = () => {
    setAllocation({
      teacher: null,
      subject: null,
      schoolClass: null,
      numberOfLessons: 1,
    });
    setStep(1);
  };

  const isFormValid = allocation.teacher && allocation.subject && allocation.schoolClass;

  return (
    <div className="add-allocation-container">
      <div className="add-allocation-header">
        <h2>Create New Allocation</h2>
        <p>Assign teachers to subjects and classes with specific lesson counts</p>
      </div>

      {/* Progress Steps */}
      <div className="allocation-progress-steps">
        {[1, 2, 3, 4].map((stepNum) => (
          <div 
            key={stepNum} 
            className={`allocation-progress-step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
          >
            <div className="allocation-progress-step-circle">
              {step > stepNum ? '✓' : stepNum}
            </div>
            <span className="allocation-progress-step-label">
              {stepNum === 1 && 'Select Teacher'}
              {stepNum === 2 && 'Select Subject'}
              {stepNum === 3 && 'Select Class'}
              {stepNum === 4 && 'Set Lessons'}
            </span>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {isFormValid && (
        <div className="allocation-summary">
          <div className="allocation-summary-item">
            <strong>Teacher:</strong> {allocation.teacher?.full_name || allocation.teacher?.teacher_name}
          </div>
          <div className="allocation-summary-item">
            <strong>Subject:</strong> {allocation.subject?.name || allocation.subject?.subject_name}
          </div>
          <div className="allocation-summary-item">
            <strong>Class:</strong> {allocation.schoolClass?.name || allocation.schoolClass?.class_name}
            {allocation.schoolClass?.stream && ` (${allocation.schoolClass.stream})`}
          </div>
          <div className="allocation-summary-item">
            <strong>Lessons/Week:</strong> {allocation.numberOfLessons}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="allocation-step-content">
        {step === 1 && (
          <div className="allocation-step">
            <h3>Step 1: Select Teacher</h3>
            <AllocationTeacherFetch onTeacherSelect={handleTeacherSelect} />
          </div>
        )}

        {step === 2 && (
          <div className="allocation-step">
            <div className="allocation-step-header">
              <button 
                className="allocation-back-button"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <h3>Step 2: Select Subject</h3>
            </div>
            <AllocationSubjectFetch onSubjectSelect={handleSubjectSelect} />
          </div>
        )}

        {step === 3 && (
          <div className="allocation-step">
            <div className="allocation-step-header">
              <button 
                className="allocation-back-button"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <h3>Step 3: Select Class</h3>
            </div>
            <AllocationClassFetch onClassSelect={handleClassSelect} />
          </div>
        )}

        {step === 4 && (
          <div className="allocation-step">
            <div className="allocation-step-header">
              <button 
                className="allocation-back-button"
                onClick={() => setStep(3)}
              >
                ← Back
              </button>
              <h3>Step 4: Set Number of Lessons</h3>
            </div>
            
            <div className="allocation-lessons-input">
              <label htmlFor="lessons">
                Number of Lessons per Week
                <span className="allocation-input-hint">(Minimum: 1, Maximum: 40)</span>
              </label>
              
              <div className="allocation-lessons-control">
                <button 
                  className="allocation-lessons-decrement"
                  onClick={() => setAllocation(prev => ({ 
                    ...prev, 
                    numberOfLessons: Math.max(1, prev.numberOfLessons - 1) 
                  }))}
                  disabled={allocation.numberOfLessons <= 1}
                >
                  −
                </button>
                
                <input
                  id="lessons"
                  type="number"
                  min="1"
                  max="40"
                  value={allocation.numberOfLessons}
                  onChange={handleNumberOfLessonsChange}
                  className="allocation-lessons-input-field"
                />
                
                <button 
                  className="allocation-lessons-increment"
                  onClick={() => setAllocation(prev => ({ 
                    ...prev, 
                    numberOfLessons: Math.min(40, prev.numberOfLessons + 1) 
                  }))}
                  disabled={allocation.numberOfLessons >= 40}
                >
                  +
                </button>
              </div>

              <div className="allocation-lessons-visual">
                <div className="allocation-lessons-bars">
                  {[...Array(40)].map((_, i) => (
                    <div 
                      key={i}
                      className={`allocation-lessons-bar ${i < allocation.numberOfLessons ? 'filled' : ''}`}
                      onClick={() => setAllocation(prev => ({ ...prev, numberOfLessons: i + 1 }))}
                    ></div>
                  ))}
                </div>
                <div className="allocation-lessons-legend">
                  <span>Fewer Lessons</span>
                  <span>More Lessons</span>
                </div>
              </div>
            </div>

            <div className="allocation-actions">
              <button 
                className="allocation-cancel-button"
                onClick={resetForm}
                type="button"
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button 
                className="allocation-submit-button"
                onClick={handleSubmit}
                disabled={mutation.isPending || !isFormValid}
                type="button"
              >
                {mutation.isPending ? (
                  <>
                    <span className="allocation-spinner"></span>
                    Creating...
                  </>
                ) : 'Create Allocation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}