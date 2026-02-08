import { useQuery } from '@tanstack/react-query';
import './AllocationTeacherFetch.css';

interface Teacher {
  teacher_id: string;
  teacher_name: string;
  teacher_code: string;
  created_at: string;
  updated_at: string;
}

interface TeachersResponse {
  message: string;
  teachers: Teacher[];
  count: number;
}

interface ApiError {
  [key: string]: string[] | undefined;
  non_field_errors?: string[];
}

export default function AllocationTeacherFetch({ 
  onTeacherSelect 
}: { 
  onTeacherSelect: (teacher: Teacher) => void 
}) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const { 
    data: teachersData, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery<TeachersResponse, ApiError>({
    queryKey: ['userTeachersForAllocation'],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiUrl}/teachers/my_teachers/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw { non_field_errors: ['Please log in to view teachers'] };
          }
          if (response.status === 500) {
            throw { non_field_errors: ['Server error. Please try again later.'] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        throw { non_field_errors: ['Failed to load teachers. Please check your connection.'] };
      }
    },
    retry: 1,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) return (
    <div className="allocation-teacher-loading">
      <div className="allocation-teacher-spinner"></div>
      <p className="allocation-teacher-loading-text">Loading teachers...</p>
    </div>
  );

  if (queryError) {
    const errorMessage = queryError.non_field_errors?.[0] || 
                        'Failed to load teachers. Please try again.';
    return (
      <div className="allocation-teacher-error">
        <svg className="allocation-teacher-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="allocation-teacher-error-message">{errorMessage}</p>
        <button 
          className="allocation-teacher-retry-btn"
          onClick={handleRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  const teachers = teachersData?.teachers || [];

  if (teachers.length === 0) {
    return (
      <div className="allocation-teacher-empty">
        <div className="allocation-teacher-empty-icon">👨‍🏫</div>
        <div className="allocation-teacher-empty-title">No teachers found</div>
        <div className="allocation-teacher-empty-message">
          You haven't created any teachers yet. Switch to "Add New Teacher" to create your first teacher.
        </div>
      </div>
    );
  }

  return (
    <div className="allocation-teacher-container">
      <div className="allocation-teacher-header">
        <h3 className="allocation-teacher-title">Available Teachers</h3>
        <div className="allocation-teacher-header-right">
          <span className="allocation-teacher-count">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
          </span>
          <button 
            className="allocation-teacher-refresh-btn"
            onClick={handleRefresh}
            title="Refresh teachers"
          >
            <svg className="allocation-teacher-refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="allocation-teacher-table-container">
        <table className="allocation-teacher-table">
          <thead>
            <tr>
              <th className="allocation-teacher-table-header">Teacher</th>
              <th className="allocation-teacher-table-header">Code</th>
              <th className="allocation-teacher-table-header">Created</th>
              <th className="allocation-teacher-table-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr 
                key={teacher.teacher_id}
                className="allocation-teacher-table-row"
                onClick={() => onTeacherSelect(teacher)}
              >
                <td className="allocation-teacher-table-cell teacher-info">
                  <div className="allocation-teacher-avatar">
                    {teacher.teacher_name.charAt(0)}
                  </div>
                  <div className="allocation-teacher-details">
                    <div className="allocation-teacher-name">{teacher.teacher_name}</div>
                  </div>
                </td>
                <td className="allocation-teacher-table-cell">
                  <div className="allocation-teacher-code">{teacher.teacher_code}</div>
                </td>
                <td className="allocation-teacher-table-cell">
                  <div className="allocation-teacher-date">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="allocation-teacher-table-cell">
                  <button 
                    className="allocation-teacher-select-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeacherSelect(teacher);
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