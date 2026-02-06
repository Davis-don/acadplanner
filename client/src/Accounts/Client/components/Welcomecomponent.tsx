// WelcomeComponent.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './welcomecomponent.css';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL 

const fetchUserProfile = async (): Promise<{ user: UserProfile }> => {
  const response = await fetch(`${apiUrl}/users/fetch_user_profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

// Greeting messages based on user type
const getInstitutionMessage = (timeGreeting: string, institutionName: string): string => {
  const messages = [
    `${timeGreeting}! ${institutionName} is ready for academic excellence today.`,
    `${timeGreeting}, ${institutionName}. Let's make today productive and impactful.`,
    `${timeGreeting} to ${institutionName} - where learning comes to life.`,
    `${timeGreeting}! ${institutionName} dashboard is updated and optimized for success.`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getUserMessage = (timeGreeting: string, firstName: string): string => {
  const messages = [
    `${timeGreeting}, ${firstName}! Welcome to your academic dashboard. Everything is running smoothly.`,
    `${timeGreeting} ${firstName}! Your schedule is looking great for today.`,
    `${timeGreeting}! Ready to tackle your academic goals today, ${firstName}?`,
    `${timeGreeting} ${firstName}. You're all set for today's learning journey.`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

function WelcomeComponent() {
  const [timeGreeting, setTimeGreeting] = useState<string>('');
  const [displayMessage, setDisplayMessage] = useState<string>('');

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    retry: 1,
  });

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good morning");
    else if (hour < 18) setTimeGreeting("Good afternoon");
    else setTimeGreeting("Good evening");
  }, []);

  // Set display message when user data is available
  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      if (user.institution_name) {
        setDisplayMessage(getInstitutionMessage(timeGreeting, user.institution_name));
      } else {
        const name = user.first_name || user.email.split('@')[0];
        setDisplayMessage(getUserMessage(timeGreeting, name));
      }
    }
  }, [userData, timeGreeting]);

  if (isLoading) {
    return (
      <div className="wc-container wc-loading">
        <div className="wc-content">
          <div className="wc-skeleton wc-skeleton-greeting"></div>
          <div className="wc-skeleton wc-skeleton-name"></div>
          <div className="wc-skeleton wc-skeleton-message"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wc-container wc-error">
        <div className="wc-content">
          <h1 className="wc-greeting">{timeGreeting}</h1>
          <p className="wc-message">
            Welcome back! There was an issue loading your profile.
          </p>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const displayName = user?.institution_name 
    ? user.institution_name 
    : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email.split('@')[0];

  return (
    <div className="wc-container">
      {/* Decorative elements */}
      <div className="wc-decoration wc-circle-1"></div>
      <div className="wc-decoration wc-circle-2"></div>
      
      <div className="wc-content">
        <h1 className="wc-greeting">{timeGreeting},</h1>
        <h2 className="wc-name">
          {user?.institution_name ? (
            <>
              <span className="wc-institution-icon">🏫</span> {displayName}
            </>
          ) : (
            displayName
          )}
        </h2>
        <p className="wc-message">
          {displayMessage || "Welcome to your academic dashboard."}
        </p>
        
        {/* Show prompt if user doesn't have an institution */}
        {user && !user.institution_name && user.role === 'client' && (
          <div className="wc-institution-prompt">
            <span className="wc-prompt-icon">💡</span>
            <span>Add your institution name to personalize your experience.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeComponent;