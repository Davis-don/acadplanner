// PreviewTemplate.tsx
import './previewtemplate.css';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';
import OverallTemplate from './OverallTemplate';

// Types for Class/Stream data (from classes app)
interface SchoolClass {
  class_id: string;
  class_name: string;
  stream: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ClassesResponse {
  message: string;
  classes: SchoolClass[];
  count: number;
}

// Types for Break data (matches TimetableBreakSerializer)
interface TimetableBreak {
  break_name: string;
  duration_minutes: number;
  position: number;
}

// Types for Template data (matches TimetableTemplateSerializer exactly)
interface TimetableTemplateData {
  template_id: string;
  name: string;
  description: string;
  day_start_time: string; // Time in HH:MM format
  lesson_duration_minutes: number;
  lessons_per_day: number;
  active_days: string[]; // Array of days like ["monday", "tuesday", "wednesday", "thursday", "friday"]
  breaks: TimetableBreak[];
  created_at: string;
}

interface TemplateResponse {
  message: string;
  data: TimetableTemplateData | null;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

function PreviewTemplate() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classStreams, setClassStreams] = useState<SchoolClass[]>([]);
  const [templateData, setTemplateData] = useState<TimetableTemplateData | null>(null);
  
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL 

  // Fetch Classes/Streams
  const { 
    data: classesData, 
    isLoading: classesLoading, 
    error: classesError,
    refetch: refetchClasses
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

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        throw { non_field_errors: ['Failed to load classes. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Fetch Template data
  const { 
    data: templateResponse, 
    isLoading: templateLoading, 
    error: templateError,
    refetch: refetchTemplate
  } = useQuery<TemplateResponse, ApiError>({
    queryKey: ['userTemplate'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/timetables/get-template/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view template'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch template:', error);
        throw { non_field_errors: ['Failed to load template. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  // Sort classes by class_name and stream
  const sortClassStreams = (classes: SchoolClass[]): SchoolClass[] => {
    return [...classes].sort((a, b) => {
      // First sort by class_name (e.g., "Class 1", "Class 2")
      const classNameA = a.class_name.toLowerCase();
      const classNameB = b.class_name.toLowerCase();
      
      if (classNameA < classNameB) return -1;
      if (classNameA > classNameB) return 1;
      
      // If same class_name, sort by stream (e.g., "A", "B")
      const streamA = a.stream.toLowerCase();
      const streamB = b.stream.toLowerCase();
      
      return streamA.localeCompare(streamB);
    });
  };

  // Group classes by class_name
  const groupClassesByName = (classes: SchoolClass[]): Record<string, SchoolClass[]> => {
    const grouped: Record<string, SchoolClass[]> = {};
    
    classes.forEach(schoolClass => {
      if (!grouped[schoolClass.class_name]) {
        grouped[schoolClass.class_name] = [];
      }
      grouped[schoolClass.class_name].push(schoolClass);
    });
    
    // Sort streams within each class group
    Object.keys(grouped).forEach(className => {
      grouped[className].sort((a, b) => a.stream.localeCompare(b.stream));
    });
    
    return grouped;
  };

  // Handle loading states
  useEffect(() => {
    setIsLoading(classesLoading || templateLoading);
  }, [classesLoading, templateLoading]);

  // Handle classes error
  useEffect(() => {
    if (classesError) {
      const errorMessage = classesError.non_field_errors?.[0] || 
                          'Failed to load classes. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [classesError, showToast]);

  // Handle template error
  useEffect(() => {
    if (templateError) {
      const errorMessage = templateError.non_field_errors?.[0] || 
                          'Failed to load template. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5);
    }
  }, [templateError, showToast]);

  // Update data when queries complete
  useEffect(() => {
    if (classesData?.classes) {
      setClassStreams(classesData.classes);
    }
  }, [classesData]);

  useEffect(() => {
    if (templateResponse?.data) {
      setTemplateData(templateResponse.data);
    } else if (templateResponse?.message === "No timetable template found") {
      // Handle case when no template exists
      setTemplateData(null);
    }
  }, [templateResponse]);

  const handleRefresh = () => {
    setError(null);
    refetchClasses();
    refetchTemplate();
    showToast('Refreshing data...', 'info', 2);
  };

  const groupedClasses = groupClassesByName(sortClassStreams(classStreams));

  return (
    <div className="preview-template-container">
      <div className="preview-template-header">
        <div className="preview-template-header-content">
          <h1 className="preview-template-title">Timetable Preview</h1>
          <div className="preview-template-stats">
            <span className="preview-template-stat">
              Classes: {classStreams.length}
            </span>
            <span className="preview-template-stat">
              Template: {templateData ? templateData.name : 'Not Set'}
            </span>
          </div>
        </div>
        
        <div className="preview-template-header-actions">
          <button 
            className="preview-template-refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <svg className="preview-template-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="preview-template-error">
          <div className="preview-template-error-icon">⚠️</div>
          <div className="preview-template-error-title">Unable to load data</div>
          <div className="preview-template-error-message">{error}</div>
          <button 
            className="preview-template-error-retry-btn"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="preview-template-loading">
          <div className="preview-template-loading-spinner"></div>
          <div className="preview-template-loading-text">
            Loading classes and template data...
          </div>
          <div className="preview-template-loading-subtext">
            This may take a moment
          </div>
        </div>
      ) : (
        <div className="preview-template-content">
          {/* Pass all fetched data directly to OverallTemplate */}
          <OverallTemplate 
            classStreams={classStreams}
            templateData={templateData}
            groupedClasses={groupedClasses}
          />
        </div>
      )}
    </div>
  );
}

export default PreviewTemplate;