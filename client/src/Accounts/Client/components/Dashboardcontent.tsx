import './dashboardcontent.css';
import { useState } from 'react';
import WelcomeComponent from './Welcomecomponent';
import InstitutionalAlert from './Institutionalalert';

function DashboardContent() {
  const [hasInstitution, setHasInstitution] = useState<boolean | null>(null);
  const [showStatusMessage, setShowStatusMessage] = useState(true);

  const handleInstitutionStatus = (status: boolean) => {
    setHasInstitution(status);
    setShowStatusMessage(true);
  };

  return (
    <div className="db-overall-container">
      <WelcomeComponent />
      
      <InstitutionalAlert onInstitutionStatus={handleInstitutionStatus} />
      
      {hasInstitution === false && showStatusMessage && (
        <div className="db-status-message db-status-warning">
          <div className="db-status-icon">🏫</div>
          <div className="db-status-content">
            <h4 className="db-status-title">Register Your Institution</h4>
            <p className="db-status-description">
              Go to the <strong>Institution Tab</strong> to register your institution name for efficient operations and full dashboard access.
            </p>
          </div>
          <button 
            className="db-status-close"
            onClick={() => setShowStatusMessage(false)}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardContent;
