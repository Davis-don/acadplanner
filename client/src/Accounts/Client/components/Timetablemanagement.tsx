// TimetableManagement.tsx
import './timetablemanagement.css'

function TimetableManagement() {
  const timetables = [
    { id: 1, name: 'Class 10A - Science', day: 'Monday', periods: 8, status: 'active' },
    { id: 2, name: 'Class 9B - Arts', day: 'Tuesday', periods: 7, status: 'active' },
    { id: 3, name: 'Class 11C - Commerce', day: 'Wednesday', periods: 6, status: 'draft' },
    { id: 4, name: 'Class 8D - General', day: 'Thursday', periods: 8, status: 'pending' },
  ];

  return (
    <div className="ttm-container">
      <div className="ttm-header">
        <h2 className="ttm-title">Timetable Management</h2>
        <button className="ttm-create-btn">➕ Create New</button>
      </div>

      <div className="ttm-grid">
        {timetables.map(timetable => (
          <div key={timetable.id} className="ttm-card">
            <div className="ttm-card-header">
              <span className="ttm-card-title">{timetable.name}</span>
              <span className={`ttm-status ttm-status-${timetable.status}`}>
                {timetable.status}
              </span>
            </div>
            <div className="ttm-card-body">
              <div className="ttm-detail">
                <span className="ttm-label">Day:</span>
                <span className="ttm-value">{timetable.day}</span>
              </div>
              <div className="ttm-detail">
                <span className="ttm-label">Periods:</span>
                <span className="ttm-value">{timetable.periods}</span>
              </div>
            </div>
            <div className="ttm-card-actions">
              <button className="ttm-action-btn">Edit</button>
              <button className="ttm-action-btn">View</button>
              <button className="ttm-action-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimetableManagement;