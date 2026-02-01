// Protectedroute.tsx
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/authenticate"; // your useAuth hook
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

function Protectedroute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can show a loader while checking auth
    return (
      <div className="protected-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → render children
  return <>{children}</>;
}

export default Protectedroute;
