// TeacherManagement.tsx
import './teachermanagement.css'

function TeacherManagement() {
  const teachers = [
    { id: 1, name: 'Dr. Sarah Smith', subject: 'Mathematics', email: 'sarah@school.edu', status: 'active' },
    { id: 2, name: 'Mr. John Davis', subject: 'Physics', email: 'john@school.edu', status: 'active' },
    { id: 3, name: 'Ms. Lisa Brown', subject: 'English', email: 'lisa@school.edu', status: 'leave' },
    { id: 4, name: 'Dr. Michael Chen', subject: 'Chemistry', email: 'michael@school.edu', status: 'active' },
  ];

  return (
    <div className="tth-container">
      <div className="tth-header">
        <h2 className="tth-title">Teacher Management</h2>
        <button className="tth-invite-btn">👨‍🏫 Invite Teacher</button>
      </div>

      <div className="tth-teachers-list">
        {teachers.map(teacher => (
          <div key={teacher.id} className="tth-teacher-card">
            <div className="tth-avatar">
              {teacher.name.charAt(0)}
            </div>
            
            <div className="tth-teacher-info">
              <h3 className="tth-teacher-name">{teacher.name}</h3>
              <div className="tth-teacher-details">
                <span className="tth-subject">{teacher.subject}</span>
                <span className="tth-email">{teacher.email}</span>
              </div>
            </div>
            
            <div className="tth-teacher-status">
              <span className={`tth-status-badge tth-status-${teacher.status}`}>
                {teacher.status}
              </span>
            </div>
            
            <div className="tth-teacher-actions">
              <button className="tth-action-btn" title="Message">
                💬
              </button>
              <button className="tth-action-btn" title="Edit">
                ✏️
              </button>
              <button className="tth-action-btn" title="Schedule">
                📅
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherManagement;