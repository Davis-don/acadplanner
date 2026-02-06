import './institutionalalert.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string | null;
}

interface InstitutionalAlertProps {
  onInstitutionStatus: (status: boolean) => void;
}

const apiUrl = import.meta.env.VITE_API_URL;

function InstitutionalAlert({ onInstitutionStatus }: InstitutionalAlertProps) {

  const fetchProfile = async (): Promise<{ user: UserProfile }> => {

    const res = await fetch(`${apiUrl}/users/fetch_user_profile/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    return res.json();
  };

  const { data } = useQuery({
    queryKey: ['userProfileForAlert'],
    queryFn: fetchProfile,
    retry: false,
  });

  useEffect(() => {

    if (data?.user) {

      const institutionExists = Boolean(
        data.user.institution_name &&
        data.user.institution_name.trim() !== ""
      );

      onInstitutionStatus(institutionExists);

    }

  }, [data, onInstitutionStatus]);


  // this component renders nothing
  return null;
}

export default InstitutionalAlert;
