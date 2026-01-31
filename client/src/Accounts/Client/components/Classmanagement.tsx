// ClassManagement.tsx
import './classmanagement.css'

function ClassManagement() {
  const classes = [
    { id: 1, name: 'Class 10A', stream: 'Science', students: 32, capacity: 40 },
    { id: 2, name: 'Class 9B', stream: 'Arts', students: 28, capacity: 35 },
    { id: 3, name: 'Class 11C', stream: 'Commerce', students: 30, capacity: 40 },
    { id: 4, name: 'Class 8D', stream: 'General', students: 35, capacity: 40 },
  ];

  return (
    <div className="tcm-container">
      <div className="tcm-header">
        <h2 className="tcm-title">Class Management</h2>
        <div className="tcm-stats">
          <div className="tcm-stat">
            <span className="tcm-stat-value">{classes.length}</span>
            <span className="tcm-stat-label">Classes</span>
          </div>
          <div className="tcm-stat">
            <span className="tcm-stat-value">125</span>
            <span className="tcm-stat-label">Total Students</span>
          </div>
        </div>
      </div>

      <div className="tcm-classes-list">
        {classes.map(cls => {
          const percentage = (cls.students / cls.capacity) * 100;
          
          return (
            <div key={cls.id} className="tcm-class-card">
              <div className="tcm-class-header">
                <div className="tcm-class-info">
                  <h3 className="tcm-class-name">{cls.name}</h3>
                  <span className="tcm-class-stream">{cls.stream}</span>
                </div>
                <div className="tcm-class-stats">
                  <div className="tcm-students-count">
                    {cls.students}/{cls.capacity}
                  </div>
                </div>
              </div>
              
              <div className="tcm-progress-container">
                <div className="tcm-progress-bar">
                  <div 
                    className="tcm-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="tcm-progress-text">
                  {percentage.toFixed(0)}% capacity
                </span>
              </div>
              
              <div className="tcm-class-actions">
                <button className="tcm-action-btn tcm-view-btn">
                  👁️ View Students
                </button>
                <button className="tcm-action-btn tcm-edit-btn">
                  ✏️ Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClassManagement;