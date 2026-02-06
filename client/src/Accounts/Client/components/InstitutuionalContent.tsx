import { useQuery } from '@tanstack/react-query';
import './institutuionalcontent.css'

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

function InstitutionContent() {
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="ic-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ic-container">
        <h1>Error loading profile</h1>
      </div>
    );
  }

  const user = userData?.user;
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email.split('@')[0];

  return (
    <div className="ic-container">
      <h1>Institution Settings</h1>
      <p>Welcome, {displayName}</p>
      <p>Institution: {user?.institution_name || 'Not registered'}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}

export default InstitutionContent;