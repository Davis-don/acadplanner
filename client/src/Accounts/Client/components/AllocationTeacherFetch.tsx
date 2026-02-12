import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '../../../store/useToaststore';
import './AllocationTeacherFetch.css';

interface Teacher {
  teacher_id: string;
  teacher_name: string;
  teacher_code: string;
  allocated: boolean;
  created_at: string;
  updated_at: string;
}

interface TeachersResponse {
  message: string;
  teachers: Teacher[];
  count: number;
}

interface ApiError {
  [key: string]: string | string[] | undefined;
  non_field_errors?: string[];
  error?: string;
}

export default function AllocationTeacherFetch({ 
  onTeacherSelect 
}: { 
  onTeacherSelect: (teacher: Teacher) => void 
}) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const { showToast } = useToast();

  const { 
    data: teachersData, 
    isLoading, 
    error: queryError,
    refetch,
    isRefetching 
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

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        throw { non_field_errors: ['Failed to load teachers. Please check your connection.'] };
      }
    },
    retry: 1,
    staleTime: 0, // Always refetch when needed
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const allocationMutation = useMutation<any, ApiError, { teacherId: string; allocated: boolean }>({
    mutationFn: async ({ teacherId, allocated }) => {
      const endpoint = allocated 
        ? `${apiUrl}/teachers/${teacherId}/allocate/`
        : `${apiUrl}/teachers/${teacherId}/deallocate/`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH', // Changed from POST to PATCH
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}), // Empty body is fine for PATCH
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            non_field_errors: [`Failed to ${allocated ? 'allocate' : 'deallocate'} teacher. Server returned ${response.status}`] 
          };
        }
        throw errorData;
      }

      return await response.json();
    },
    
    onMutate: async ({ allocated }) => {
      // Cancel any outgoing refetches
      await refetch();
      
      showToast(
        allocated ? 'Allocating teacher...' : 'Deallocating teacher...',
        'info',
        3
      );
    },
    
    onSuccess: ( { allocated }) => {
      showToast(
        allocated 
          ? 'Teacher allocated successfully!' 
          : 'Teacher deallocated successfully!',
        'success',
        4
      );
      
      // Force refetch to get updated data
      setTimeout(() => {
        refetch();
      }, 100); // Small delay to ensure server has processed
    },
    
    onError: (error, { allocated }) => {
      console.error('Allocation error:', error);
      
      // Show error toast
      showToast(
        error?.non_field_errors?.[0] || 
        error?.error ||
        (allocated 
          ? 'Failed to allocate teacher. Please try again.' 
          : 'Failed to deallocate teacher. Please try again.'),
        'error',
        5
      );
      
      // Refetch to ensure UI is in sync with server
      setTimeout(() => {
        refetch();
      }, 200);
    },
    
    onSettled: () => {
      // Always refetch after mutation completes to ensure data consistency
      setTimeout(() => {
        refetch();
      }, 150);
    },
  });

  const handleAllocationToggle = (e: React.MouseEvent | React.ChangeEvent, teacher: Teacher) => {
    e.stopPropagation(); // Prevent row click
    e.preventDefault(); // Prevent default checkbox behavior
    
    // Optimistic update could be added here if needed
    
    allocationMutation.mutate({ 
      teacherId: teacher.teacher_id, 
      allocated: !teacher.allocated 
    });
  };

  const handleSelectClick = (e: React.MouseEvent, teacher: Teacher) => {
    e.stopPropagation(); // Prevent row click
    if (!teacher.allocated) {
      onTeacherSelect(teacher);
    }
  };

  const handleRowClick = (teacher: Teacher) => {
    // Only select if not allocated
    if (!teacher.allocated) {
      onTeacherSelect(teacher);
    }
  };

  const handleRefresh = async () => {
    showToast('Refreshing teachers...', 'info', 2);
    await refetch();
    showToast('Teachers refreshed', 'success', 2);
  };

  // Sort teachers: allocated at the bottom, unallocated at the top
  const sortedTeachers = teachersData?.teachers 
    ? [...teachersData.teachers].sort((a, b) => {
        if (a.allocated === b.allocated) return 0;
        return a.allocated ? 1 : -1; // Allocated go to bottom
      })
    : [];

  // Show loading state
  if (isLoading) return (
    <div className="allocation-teacher-loading">
      <div className="allocation-teacher-spinner"></div>
      <p className="allocation-teacher-loading-text">Loading teachers...</p>
    </div>
  );

  // Show error state
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
          disabled={isRefetching}
        >
          {isRefetching ? 'Refreshing...' : 'Try Again'}
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

  const allocatedCount = teachers.filter(t => t.allocated).length;
  const unallocatedCount = teachers.length - allocatedCount;

  return (
    <div className="allocation-teacher-container">
      <div className="allocation-teacher-header">
        <h3 className="allocation-teacher-title">Available Teachers</h3>
        <div className="allocation-teacher-header-right">
          <div className="allocation-teacher-stats">
            <span className="allocation-teacher-stat-unallocated">
              Available: {unallocatedCount}
            </span>
            <span className="allocation-teacher-stat-allocated">
              Allocated: {allocatedCount}
            </span>
          </div>
          <span className="allocation-teacher-count">
            Total: {teachers.length}
          </span>
          <button 
            className={`allocation-teacher-refresh-btn ${isRefetching ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            title="Refresh teachers"
            disabled={isRefetching}
          >
            <svg 
              className={`allocation-teacher-refresh-icon ${isRefetching ? 'spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
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
              <th className="allocation-teacher-table-header">Allocated</th>
              <th className="allocation-teacher-table-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeachers.map((teacher) => (
              <tr 
                key={teacher.teacher_id}
                className={`allocation-teacher-table-row ${
                  teacher.allocated ? 'teacher-allocated' : ''
                } ${!teacher.allocated ? 'row-selectable' : ''} ${
                  allocationMutation.isPending ? 'mutation-pending' : ''
                }`}
                onClick={() => handleRowClick(teacher)}
                style={{ cursor: teacher.allocated ? 'default' : 'pointer' }}
              >
                <td className="allocation-teacher-table-cell teacher-info">
                  <div className={`allocation-teacher-avatar ${
                    teacher.allocated ? 'avatar-allocated' : ''
                  }`}>
                    {teacher.teacher_name.charAt(0)}
                  </div>
                  <div className="allocation-teacher-details">
                    <div className={`allocation-teacher-name ${
                      teacher.allocated ? 'text-allocated' : ''
                    }`}>
                      {teacher.teacher_name}
                    </div>
                    {teacher.allocated && (
                      <div className="allocation-teacher-badge">Allocated</div>
                    )}
                  </div>
                </td>
                <td className="allocation-teacher-table-cell">
                  <div className={`allocation-teacher-code ${
                    teacher.allocated ? 'code-allocated' : ''
                  }`}>
                    {teacher.teacher_code}
                  </div>
                </td>
                <td className="allocation-teacher-table-cell">
                  <div className="allocation-teacher-date">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="allocation-teacher-table-cell" onClick={(e) => e.stopPropagation()}>
                  <div className="allocation-checkbox-wrapper">
                    <label className="allocation-checkbox-label">
                      <input
                        type="checkbox"
                        className="allocation-checkbox"
                        checked={teacher.allocated}
                        onChange={(e) => handleAllocationToggle(e, teacher)}
                        disabled={allocationMutation.isPending}
                      />
                      <span className="allocation-checkbox-custom"></span>
                    </label>
                  </div>
                </td>
                <td className="allocation-teacher-table-cell" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={`allocation-teacher-select-btn ${
                      teacher.allocated ? 'btn-disabled' : ''
                    }`}
                    onClick={(e) => handleSelectClick(e, teacher)}
                    disabled={teacher.allocated || allocationMutation.isPending}
                    title={teacher.allocated ? 'Teacher is already allocated' : 'Select teacher'}
                  >
                    {teacher.allocated ? 'Allocated' : 'Select'}
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