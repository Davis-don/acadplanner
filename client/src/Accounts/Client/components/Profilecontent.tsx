// components/ProfileContent.tsx
import './profilecontent.css'

function ProfileContent() {
  return (
    <div className="clac-profile-content">
      
      {/* Profile Header */}
      <div className="clac-profile-header">
        <div className="clac-profile-avatar">
          <div className="clac-avatar-large">JD</div>
          <button className="clac-avatar-upload">📷</button>
        </div>
        <div className="clac-profile-info">
          <h2 className="clac-profile-name">John Doe</h2>
          <p className="clac-profile-role">Academic Coordinator</p>
          <div className="clac-profile-stats">
            <div className="clac-stat-item">
              <span className="clac-stat-number">2</span>
              <span className="clac-stat-label">Years</span>
            </div>
            <div className="clac-stat-item">
              <span className="clac-stat-number">12</span>
              <span className="clac-stat-label">Classes</span>
            </div>
            <div className="clac-stat-item">
              <span className="clac-stat-number">240</span>
              <span className="clac-stat-label">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="clac-section">
        <h3 className="clac-section-title">Personal Information</h3>
        <form className="clac-profile-form">
          <div className="clac-form-row">
            <div className="clac-form-group">
              <label className="clac-form-label">First Name</label>
              <input 
                type="text" 
                className="clac-form-input" 
                defaultValue="John"
                placeholder="Enter first name"
              />
            </div>
            <div className="clac-form-group">
              <label className="clac-form-label">Last Name</label>
              <input 
                type="text" 
                className="clac-form-input" 
                defaultValue="Doe"
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="clac-form-group">
            <label className="clac-form-label">Email Address</label>
            <input 
              type="email" 
              className="clac-form-input" 
              defaultValue="john.doe@school.edu"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="clac-form-group">
            <label className="clac-form-label">Phone Number</label>
            <input 
              type="tel" 
              className="clac-form-input" 
              defaultValue="+1 (555) 123-4567"
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="clac-form-group">
            <label className="clac-form-label">School</label>
            <input 
              type="text" 
              className="clac-form-input" 
              defaultValue="Prestige High School"
              placeholder="Enter school name"
            />
          </div>
          
          <div className="clac-form-actions">
            <button type="button" className="clac-secondary-btn">Cancel</button>
            <button type="submit" className="clac-primary-btn">Save Changes</button>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div className="clac-section">
        <h3 className="clac-section-title">Account Settings</h3>
        <div className="clac-settings-list">
          <div className="clac-setting-item">
            <div className="clac-setting-info">
              <h4 className="clac-setting-title">Change Password</h4>
              <p className="clac-setting-desc">Update your account password</p>
            </div>
            <button className="clac-action-btn">Update</button>
          </div>
          
          <div className="clac-setting-item">
            <div className="clac-setting-info">
              <h4 className="clac-setting-title">Notification Preferences</h4>
              <p className="clac-setting-desc">Manage email and push notifications</p>
            </div>
            <button className="clac-action-btn">Configure</button>
          </div>
          
          <div className="clac-setting-item">
            <div className="clac-setting-info">
              <h4 className="clac-setting-title">Privacy Settings</h4>
              <p className="clac-setting-desc">Control your data and privacy</p>
            </div>
            <button className="clac-action-btn">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileContent;