import { useState, useEffect } from 'react';


export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const res = await fetch(`${apiUrl}/users/check_auth/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Important for cookies
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          // Don't navigate here - let ProtectedRoute handle it
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []); // Empty dependency array - runs once on mount

  return { isAuthenticated, loading, user };
};