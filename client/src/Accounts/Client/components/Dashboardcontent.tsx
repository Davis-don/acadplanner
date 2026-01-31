// components/DashboardContent.tsx
import './dashboardcontent.css'

function DashboardContent() {
  // Dummy data for dashboard
  const stats = [
    { label: 'Active Classes', value: '12', change: '+2', icon: '🏫' },
    { label: 'Scheduled Hours', value: '36', change: '+4', icon: '⏰' },
    { label: 'Pending Tasks', value: '8', change: '-3', icon: '📋' },
    { label: 'Students', value: '240', change: '+15', icon: '👥' },
  ];

  const recentActivities = [
    { time: '10:30 AM', activity: 'Created new timetable for Class 10A', user: 'You' },
    { time: 'Yesterday', activity: 'Updated Physics schedule', user: 'You' },
    { time: '2 days ago', activity: 'Added new teacher account', user: 'Admin' },
    { time: '1 week ago', activity: 'System maintenance completed', user: 'System' },
  ];

  return (
    <div className="clac-dashboard-content">
      
      {/* Stats Grid */}
      <div className="clac-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="clac-stat-card">
            <div className="clac-stat-header">
              <span className="clac-stat-icon">{stat.icon}</span>
              <span className="clac-stat-change">{stat.change}</span>
            </div>
            <div className="clac-stat-value">{stat.value}</div>
            <div className="clac-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="clac-section">
        <h3 className="clac-section-title">Recent Activities</h3>
        <div className="clac-activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="clac-activity-item">
              <div className="clac-activity-time">{activity.time}</div>
              <div className="clac-activity-details">
                <div className="clac-activity-text">{activity.activity}</div>
                <div className="clac-activity-user">{activity.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="clac-section">
        <h3 className="clac-section-title">Quick Actions</h3>
        <div className="clac-actions-grid">
          <button className="clac-action-btn">
            <span className="clac-action-icon">➕</span>
            <span className="clac-action-label">Create Timetable</span>
          </button>
          <button className="clac-action-btn">
            <span className="clac-action-icon">📅</span>
            <span className="clac-action-label">Schedule Class</span>
          </button>
          <button className="clac-action-btn">
            <span className="clac-action-icon">👨‍🏫</span>
            <span className="clac-action-label">Add Teacher</span>
          </button>
          <button className="clac-action-btn">
            <span className="clac-action-icon">📊</span>
            <span className="clac-action-label">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;