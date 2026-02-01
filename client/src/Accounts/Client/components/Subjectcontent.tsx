// components/Subjectscontent.tsx
import './subjectcontent.css'

const SubjectsContent = () => {
  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH', credits: 4, department: 'Science' },
    { id: 2, name: 'Physics', code: 'PHYS', credits: 3, department: 'Science' },
    { id: 3, name: 'Chemistry', code: 'CHEM', credits: 3, department: 'Science' },
    { id: 4, name: 'English Literature', code: 'ENGL', credits: 3, department: 'Arts' },
    { id: 5, name: 'Computer Science', code: 'COMP', credits: 4, department: 'Technology' },
  ];

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h2>Subjects Management</h2>
        <p>View and manage all academic subjects</p>
      </div>
      
      <div className="subjects-table-container">
        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>
                  <span className="subject-code-badge">{subject.code}</span>
                </td>
                <td>
                  <div className="subject-name-cell">
                    <span className="subject-icon">📚</span>
                    {subject.name}
                  </div>
                </td>
                <td>
                  <span className="department-badge">{subject.department}</span>
                </td>
                <td>
                  <span className="credits-badge">{subject.credits} credits</span>
                </td>
                <td>
                  <div className="subject-actions">
                    <button className="action-btn view-btn">View</button>
                    <button className="action-btn edit-btn">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="subjects-summary">
        <div className="summary-card">
          <h3>Department Distribution</h3>
          <ul className="department-list">
            <li>
              <span className="dept-name">Science</span>
              <span className="dept-count">3 subjects</span>
            </li>
            <li>
              <span className="dept-name">Arts</span>
              <span className="dept-count">1 subject</span>
            </li>
            <li>
              <span className="dept-name">Technology</span>
              <span className="dept-count">1 subject</span>
            </li>
          </ul>
        </div>
        <div className="summary-card">
          <h3>Total Credits</h3>
          <p className="total-credits">
            {subjects.reduce((sum, s) => sum + s.credits, 0)} credits
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectsContent;