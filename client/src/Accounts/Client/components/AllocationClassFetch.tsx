import { useQuery } from '@tanstack/react-query';
import './AllocationClassFetch.css';

// Define interface matching API response
interface ApiClass {
  class_id: string;
  class_name: string;
  stream: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Define interface for what parent expects (minimal mapping)
interface ClassForParent {
  class_id: string;
  name: string; // Map from class_name
  stream: string;
  academic_year: string; // Empty since API doesn't have it
  capacity: number; // Default value since API doesn't have it
  created_at: string;
  updated_at: string;
}

interface ClassesResponse {
  message: string;
  classes: ApiClass[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

export default function AllocationClassFetch({ 
  onClassSelect 
}: { 
  onClassSelect: (schoolClass: ClassForParent) => void 
}) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const { 
    data: classesData, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery<ClassesResponse, ApiError>({
    queryKey: ['userClassesForAllocation'],
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

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        throw { non_field_errors: ['Failed to load classes. Please check your connection.'] };
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

  // Helper function to map API class to parent expected format
  const mapToParentFormat = (apiClass: ApiClass): ClassForParent => {
    return {
      class_id: apiClass.class_id,
      name: apiClass.class_name, // Map class_name to name
      stream: apiClass.stream,
      academic_year: '', // Empty string since API doesn't provide it
      capacity: 0, // Default value since API doesn't provide it
      created_at: apiClass.created_at,
      updated_at: apiClass.updated_at
    };
  };

  if (isLoading) return (
    <div className="allocation-class-loading">
      <div className="allocation-class-spinner"></div>
      <p className="allocation-class-loading-text">Loading classes...</p>
    </div>
  );

  if (queryError) {
    const errorMessage = queryError.non_field_errors?.[0] || 
                        'Failed to load classes. Please try again.';
    return (
      <div className="allocation-class-error">
        <svg className="allocation-class-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="allocation-class-error-message">{errorMessage}</p>
        <button 
          className="allocation-class-retry-btn"
          onClick={handleRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  const classes = classesData?.classes || [];

  if (classes.length === 0) {
    return (
      <div className="allocation-class-empty">
        <div className="allocation-class-empty-icon">🏫</div>
        <div className="allocation-class-empty-title">No classes found</div>
        <div className="allocation-class-empty-message">
          You haven't created any classes yet. Switch to "Add New Class" to create your first class.
        </div>
      </div>
    );
  }

  return (
    <div className="allocation-class-container">
      <div className="allocation-class-header">
        <h3 className="allocation-class-title">Available Classes</h3>
        <div className="allocation-class-header-right">
          <span className="allocation-class-count">
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
          </span>
          <button 
            className="allocation-class-refresh-btn"
            onClick={handleRefresh}
            title="Refresh classes"
          >
            <svg className="allocation-class-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="allocation-class-table-container">
        <table className="allocation-class-table">
          <thead>
            <tr>
              <th className="allocation-class-table-header">Class Name</th>
              <th className="allocation-class-table-header">Stream</th>
              <th className="allocation-class-table-header">Created</th>
              <th className="allocation-class-table-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((schoolClass) => (
              <tr 
                key={schoolClass.class_id}
                className="allocation-class-table-row"
                onClick={() => onClassSelect(mapToParentFormat(schoolClass))}
              >
                <td className="allocation-class-table-cell class-info">
                  <div className="allocation-class-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="allocation-class-details">
                    <div className="allocation-class-name">{schoolClass.class_name}</div>
                  </div>
                </td>
                <td className="allocation-class-table-cell">
                  <div className="allocation-class-stream-badge">{schoolClass.stream}</div>
                </td>
                <td className="allocation-class-table-cell">
                  <div className="allocation-class-date">
                    {formatDate(schoolClass.created_at)}
                  </div>
                </td>
                <td className="allocation-class-table-cell">
                  <button 
                    className="allocation-class-select-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClassSelect(mapToParentFormat(schoolClass));
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