// components/Teacherscontent.tsx
import './teacherscontent.css'

const TeachersContent = () => {
  const teachers = [
    { id: 1, name: 'Dr. Sarah Smith', email: 'sarah.smith@example.com', department: 'Mathematics', subjects: ['Calculus', 'Algebra'] },
    { id: 2, name: 'Prof. John Johnson', email: 'john.johnson@example.com', department: 'Physics', subjects: ['Mechanics', 'Thermodynamics'] },
    { id: 3, name: 'Dr. Emily Williams', email: 'emily.williams@example.com', department: 'Chemistry', subjects: ['Organic Chemistry', 'Biochemistry'] },
    { id: 4, name: 'Prof. Michael Brown', email: 'michael.brown@example.com', department: 'English', subjects: ['Literature', 'Creative Writing'] },
  ];

  return (
    <div className="teachers-container">
      <div className="teachers-header">
        <h2>Teachers Directory</h2>
        <p>Browse and manage teacher information</p>
      </div>
      
      <div className="teachers-list">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="teacher-card">
            <div className="teacher-avatar">
              <span className="avatar-icon">👨‍🏫</span>
            </div>
            <div className="teacher-info">
              <h3 className="teacher-name">{teacher.name}</h3>
              <p className="teacher-email">{teacher.email}</p>
              <div className="teacher-details">
                <span className="teacher-department">{teacher.department}</span>
                <div className="teacher-subjects">
                  {teacher.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">{subject}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="teacher-actions">
              <button className="teacher-btn contact-btn">Contact</button>
              <button className="teacher-btn schedule-btn">View Schedule</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="teachers-stats">
        <div className="teacher-stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <h4>Total Teachers</h4>
            <p className="stat-number">{teachers.length}</p>
          </div>
        </div>
        <div className="teacher-stat-card">
          <div className="stat-icon">🏫</div>
          <div>
            <h4>Departments</h4>
            <p className="stat-number">{new Set(teachers.map(t => t.department)).size}</p>
          </div>
        </div>
        <div className="teacher-stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <h4>Subjects Covered</h4>
            <p className="stat-number">{new Set(teachers.flatMap(t => t.subjects)).size}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersContent;