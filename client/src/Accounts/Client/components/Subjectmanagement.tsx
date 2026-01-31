// SubjectManagement.tsx
import './subjectmanagement.css'

function SubjectManagement() {
  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', teacher: 'Dr. Smith', hours: 5 },
    { id: 2, name: 'Physics', code: 'PHYS102', teacher: 'Ms. Johnson', hours: 4 },
    { id: 3, name: 'Chemistry', code: 'CHEM103', teacher: 'Mr. Williams', hours: 4 },
    { id: 4, name: 'English', code: 'ENG104', teacher: 'Mrs. Brown', hours: 6 },
  ];

  return (
    <div className="tsm-container">
      <div className="tsm-header">
        <h2 className="tsm-title">Subject Management</h2>
        <div className="tsm-actions">
          <input 
            type="text" 
            className="tsm-search" 
            placeholder="Search subjects..." 
          />
          <button className="tsm-add-btn">➕ Add Subject</button>
        </div>
      </div>

      <table className="tsm-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Code</th>
            <th>Teacher</th>
            <th>Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => (
            <tr key={subject.id} className="tsm-row">
              <td>
                <div className="tsm-subject-info">
                  <div className="tsm-subject-name">{subject.name}</div>
                </div>
              </td>
              <td>
                <span className="tsm-code">{subject.code}</span>
              </td>
              <td>
                <span className="tsm-teacher">{subject.teacher}</span>
              </td>
              <td>
                <span className="tsm-hours">{subject.hours} hrs</span>
              </td>
              <td>
                <div className="tsm-row-actions">
                  <button className="tsm-edit-btn">✏️</button>
                  <button className="tsm-delete-btn">🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectManagement;