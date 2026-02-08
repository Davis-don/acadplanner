import { useQuery } from '@tanstack/react-query';
import './AllocationSubjectFetch.css';

// Define interface matching API response
interface ApiSubject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  created_at: string;
  updated_at: string;
}

// Define interface for what parent expects
interface SubjectForParent {
  subject_id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface SubjectsResponse {
  message: string;
  subjects: ApiSubject[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

export default function AllocationSubjectFetch({ 
  onSubjectSelect 
}: { 
  onSubjectSelect: (subject: SubjectForParent) => void 
}) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const { 
    data: subjectsData, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery<SubjectsResponse, ApiError>({
    queryKey: ['userSubjectsForAllocation'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/subjects/my_subjects/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view subjects'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        throw { non_field_errors: ['Failed to load subjects. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  const handleRefresh = () => {
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper function to map API subject to parent expected format
  const mapToParentFormat = (apiSubject: ApiSubject): SubjectForParent => {
    return {
      subject_id: apiSubject.subject_id,
      name: apiSubject.subject_name, // Map subject_name to name
      code: apiSubject.subject_code, // Map subject_code to code
      description: '', // Empty since API doesn't return description
      created_at: apiSubject.created_at,
      updated_at: apiSubject.updated_at
    };
  };

  if (isLoading) return (
    <div className="allocation-subject-loading">
      <div className="allocation-subject-spinner"></div>
      <p className="allocation-subject-loading-text">Loading subjects...</p>
    </div>
  );

  if (queryError) {
    const errorMessage = queryError.non_field_errors?.[0] || 
                        'Failed to load subjects. Please try again.';
    return (
      <div className="allocation-subject-error">
        <svg className="allocation-subject-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="allocation-subject-error-message">{errorMessage}</p>
        <button 
          className="allocation-subject-retry-btn"
          onClick={handleRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  const subjects = subjectsData?.subjects || [];

  if (subjects.length === 0) {
    return (
      <div className="allocation-subject-empty">
        <div className="allocation-subject-empty-icon">📚</div>
        <div className="allocation-subject-empty-title">No subjects found</div>
        <div className="allocation-subject-empty-message">
          You haven't created any subjects yet. Switch to "Add New Subject" to create your first subject.
        </div>
      </div>
    );
  }

  return (
    <div className="allocation-subject-container">
      <div className="allocation-subject-header">
        <h3 className="allocation-subject-title">Available Subjects</h3>
        <div className="allocation-subject-header-right">
          <span className="allocation-subject-count">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </span>
          <button 
            className="allocation-subject-refresh-btn"
            onClick={handleRefresh}
            title="Refresh subjects"
          >
            <svg className="allocation-subject-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="allocation-subject-table-container">
        <table className="allocation-subject-table">
          <thead>
            <tr>
              <th className="allocation-subject-table-header">Subject</th>
              <th className="allocation-subject-table-header">Code</th>
              <th className="allocation-subject-table-header">Created</th>
              <th className="allocation-subject-table-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr 
                key={subject.subject_id}
                className="allocation-subject-table-row"
                onClick={() => onSubjectSelect(mapToParentFormat(subject))}
              >
                <td className="allocation-subject-table-cell subject-info">
                  <div className="allocation-subject-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="allocation-subject-details">
                    <div className="allocation-subject-name">{subject.subject_name}</div>
                  </div>
                </td>
                <td className="allocation-subject-table-cell">
                  <div className="allocation-subject-code">{subject.subject_code}</div>
                </td>
                <td className="allocation-subject-table-cell">
                  <div className="allocation-subject-date">
                    {formatDate(subject.created_at)}
                  </div>
                </td>
                <td className="allocation-subject-table-cell">
                  <button 
                    className="allocation-subject-select-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubjectSelect(mapToParentFormat(subject));
                    }}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}