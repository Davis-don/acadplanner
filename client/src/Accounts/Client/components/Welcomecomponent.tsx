// WelcomeComponent.tsx
import './welcomecomponent.css'

function WelcomeComponent() {
  // Get current time for greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="wc-container">
      {/* Decorative elements */}
      <div className="wc-decoration wc-circle-1"></div>
      <div className="wc-decoration wc-circle-2"></div>
      
      <div className="wc-content">
        <h1 className="wc-greeting">{getTimeBasedGreeting()},</h1>
        <h2 className="wc-name">John Doe</h2>
        <p className="wc-message">
          Welcome to your academic dashboard. Everything is running smoothly and you're all set for today's schedule.
        </p>
      </div>
    </div>
  );
}

export default WelcomeComponent;