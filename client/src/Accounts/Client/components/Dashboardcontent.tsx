// DashboardContent.tsx
import './dashboardcontent.css';
import WelcomeComponent from './Welcomecomponent';

function DashboardContent() {
  return (
    <div className="db-overall-container">
      <WelcomeComponent />
      {/* The dashboard is intentionally kept simple with just the welcome message */}
    </div>
  );
}

export default DashboardContent;