// components/TimetablesContent.tsx
import './timetablecontent.css'

function TimetablesContent() {
  // Dummy data for timetables
  const timetables = [
    { id: 1, name: 'Class 10A - Science', teacher: 'Dr. Smith', hours: '36', status: 'active' },
    { id: 2, name: 'Class 9B - Arts', teacher: 'Ms. Johnson', hours: '30', status: 'active' },
    { id: 3, name: 'Class 11C - Commerce', teacher: 'Mr. Williams', hours: '32', status: 'draft' },
    { id: 4, name: 'Class 8D - General', teacher: 'Mrs. Brown', hours: '28', status: 'pending' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '1:00-2:00', '2:00-3:00'];

  return (
    <div className="clac-timetables-content">
      
      {/* Timetable List */}
      <div className="clac-section">
        <div className="clac-section-header">
          <h3 className="clac-section-title">Your Timetables</h3>
          <button className="clac-primary-btn">+ Create New</button>
        </div>
        
        <div className="clac-timetable-list">
          {timetables.map((timetable) => (
            <div key={timetable.id} className="clac-timetable-card">
              <div className="clac-timetable-info">
                <h4 className="clac-timetable-name">{timetable.name}</h4>
                <div className="clac-timetable-meta">
                  <span>Teacher: {timetable.teacher}</span>
                  <span>•</span>
                  <span>{timetable.hours} hours</span>
                </div>
              </div>
              <div className="clac-timetable-actions">
                <span className={`clac-status-badge clac-status-${timetable.status}`}>
                  {timetable.status}
                </span>
                <button className="clac-action-btn">View</button>
                <button className="clac-action-btn">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Timetable Grid */}
      <div className="clac-section">
        <h3 className="clac-section-title">Today's Schedule (Monday)</h3>
        <div className="clac-timetable-grid">
          <div className="clac-timetable-header">
            <div className="clac-time-slot">Time</div>
            {days.map(day => (
              <div key={day} className="clac-day-header">{day}</div>
            ))}
          </div>
          
          {periods.map((period, index) => (
            <div key={period} className="clac-timetable-row">
              <div className="clac-time-slot">{period}</div>
              {days.map(day => (
                <div key={`${day}-${index}`} className="clac-period-cell">
                  {index === 0 && day === 'Monday' ? 'Math' : 
                   index === 1 && day === 'Monday' ? 'Science' : 
                   index === 2 && day === 'Monday' ? 'Break' : 
                   index === 3 && day === 'Monday' ? 'English' : '-'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimetablesContent;