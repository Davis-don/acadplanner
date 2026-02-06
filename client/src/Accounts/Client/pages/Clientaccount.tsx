import './clientaccount.css';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../store/useToaststore';
import DashboardContent from '../components/Dashboardcontent';
import TimetablesContent from '../components/Timetablecontent';
import ProfileContent from '../components/Profilecontent';
import ClassesContent from '../components/Classcontent';
import SubjectsContent from '../components/Subjectcontent';
import TeachersContent from '../components/Teacherscontent';
import InstitutionContent from '../components/InstitutuionalContent';
import AllocationContent from '../components/Allocationcontent';
import Walletbalance from '../components/Walletbalance';

// Define the type for navigation items
type NavItem = {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  badge?: number;
  requiresAuth?: boolean;
};

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string | null;
}

function Clientaccount() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch user profile for header
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

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['userProfileForHeader'],
    queryFn: fetchUserProfile,
    retry: 1,
  });

  // Logout mutation using TanStack Query
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Logout failed');
      }

      return result;
    },

    onMutate: () => {
      showToast('Logging out...', 'info', 2);
      setShowLogoutModal(false);
    },

    onSuccess: (data) => {
      showToast(data.message || 'Logged out successfully!', 'success', 3);
      
      // Clear any localStorage items
      localStorage.removeItem('rememberEmail');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    },

    onError: (error: Error) => {
      showToast(error.message || 'Logout failed. Please try again.', 'error', 4);
    },
  });

  // Navigation items configuration with Institution and Allocation tabs
  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      component: DashboardContent,
      requiresAuth: true
    },
    { 
      id: 'institution', 
      label: 'Institution', 
      icon: '🏫', 
      component: InstitutionContent,
      requiresAuth: true
    },
    { 
      id: 'allocation', 
      label: 'Allocation', 
      icon: '📍', 
      component: AllocationContent,
      requiresAuth: true
    },
    { 
      id: 'classes', 
      label: 'Classes', 
      icon: '🎒', 
      component: ClassesContent,
      requiresAuth: true
    },
    { 
      id: 'subjects', 
      label: 'Subjects', 
      icon: '📚', 
      component: SubjectsContent,
      requiresAuth: true
    },
    { 
      id: 'teachers', 
      label: 'Teachers', 
      icon: '👨‍🏫', 
      component: TeachersContent,
      requiresAuth: true
    },
    { 
      id: 'timetables', 
      label: 'Timetables', 
      icon: '⏰', 
      component: TimetablesContent,
      requiresAuth: true
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤', 
      component: ProfileContent,
      requiresAuth: true
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      icon: '🚪', 
      component: DashboardContent,
      requiresAuth: true
    },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      setShowLogoutModal(true);
      return;
    }
    
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleConfirmLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || DashboardContent;
  const isLoggingOut = logoutMutation.isPending;

  // Get user name from fetched data
  const getUserName = () => {
    if (userLoading) return "Loading...";
    if (userError) return "User";
    
    const user = userData?.user;
    if (user) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
    }
    return "User";
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userLoading) return "U";
    if (userError) return "U";
    
    const user = userData?.user;
    if (user) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      if (firstName) return firstName.charAt(0).toUpperCase();
      if (lastName) return lastName.charAt(0).toUpperCase();
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get the subtitle based on active tab
  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview of your academic planning activities';
      case 'institution':
        return 'Manage your institution settings';
      case 'allocation':
        return 'Manage resource and teacher allocations';
      case 'classes':
        return 'Manage and organize your classes and sections';
      case 'subjects':
        return 'View and manage all academic subjects';
      case 'teachers':
        return 'Browse and manage teacher information';
      case 'timetables':
        return 'Manage and view your timetables';
      case 'profile':
        return 'Update your personal information and settings';
      default:
        return '';
    }
  };

  return (
    <div className="clac-overall-container">
      
      {/* Header */}
      <header className="clac-header">
        <div className="clac-header-left">
          <button 
            className="clac-hamburger-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            disabled={isLoggingOut}
          >
            <span className="clac-hamburger-icon">☰</span>
          </button>
          <div className="clac-company-name">AcadPlanner Pro</div>
        </div>
        
        <div className="clac-header-right">
          <Walletbalance />
          
          <div className="clac-user-info">
            <div className={`clac-avatar ${userLoading ? 'clac-avatar-loading' : ''}`}>
              {userLoading ? (
                <div className="clac-avatar-spinner"></div>
              ) : (
                getUserInitials()
              )}
            </div>
            <span className={`clac-user-name ${userLoading ? 'clac-user-name-loading' : ''}`}>
              {getUserName()}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div 
        className={`clac-mobile-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={() => !isLoggingOut && setIsMobileMenuOpen(false)}
      />

      {/* Main Layout */}
      <div className="clac-main-layout">
        
        {/* Sidebar Navigation */}
        <aside className={`clac-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="clac-sidebar-header">
            <h2 className="clac-sidebar-title">Navigation</h2>
            <p className="clac-sidebar-subtitle">Academic Management</p>
          </div>
          
          <nav className="clac-nav-container">
            <ul className="clac-nav-list">
              {/* Academic Management Section */}
              <li className="clac-nav-section">
                <span className="clac-nav-section-label">Management</span>
              </li>
              {navItems.filter(item => ['dashboard', 'institution', 'allocation'].includes(item.id)).map((item) => (
                <li key={item.id} className="clac-nav-item">
                  <button
                    className={`clac-nav-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    disabled={isLoggingOut}
                  >
                    <span className="clac-nav-icon">{item.icon}</span>
                    <span className="clac-nav-label">{item.label}</span>
                  </button>
                </li>
              ))}

              {/* Academic Resources */}
              <li className="clac-nav-section">
                <span className="clac-nav-section-label">Resources</span>
              </li>
              {navItems.filter(item => ['classes', 'subjects', 'teachers', 'timetables'].includes(item.id)).map((item) => (
                <li key={item.id} className="clac-nav-item">
                  <button
                    className={`clac-nav-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    disabled={isLoggingOut}
                  >
                    <span className="clac-nav-icon">{item.icon}</span>
                    <span className="clac-nav-label">{item.label}</span>
                  </button>
                </li>
              ))}

              {/* Account Section */}
              <li className="clac-nav-section">
                <span className="clac-nav-section-label">Account</span>
              </li>
              {navItems.filter(item => ['profile', 'logout'].includes(item.id)).map((item) => (
                <li key={item.id} className="clac-nav-item">
                  <button
                    className={`clac-nav-link ${activeTab === item.id ? 'active' : ''} ${item.id === 'logout' && isLoggingOut ? 'logging-out' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    disabled={isLoggingOut && item.id !== 'logout'}
                  >
                    <span className="clac-nav-icon">{item.icon}</span>
                    <span className="clac-nav-label">
                      {item.id === 'logout' && isLoggingOut ? 'Logging out...' : item.label}
                    </span>
                    {item.id === 'logout' && isLoggingOut && (
                      <span className="clac-nav-logout-spinner"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="clac-sidebar-footer">
            <div className="clac-account-summary">
              <div className="clac-account-role">Client Account</div>
              <div className="clac-account-plan">Premium Plan</div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="clac-content-area">
          <div className="clac-content-header">
            <div className="clac-content-title-row">
              <h1 className="clac-content-title">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <div className="clac-content-actions">
                {/* Action buttons can be added here */}
              </div>
            </div>
            <p className="clac-content-subtitle">{getSubtitle()}</p>
          </div>
          
          <div className="clac-content-wrapper">
            <ActiveComponent />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="clac-footer">
        <div className="clac-footer-left">
          © 2024 AcadPlanner. All rights reserved.
        </div>
        <div className="clac-footer-right">
          <span>System Status: <span style={{color: 'var(--success-color)'}}>●</span> Operational</span>
          <span className="clac-version">v2.1.0</span>
          <span>Last updated: Today</span>
        </div>
      </footer>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <div className="logout-modal-icon">🚪</div>
              <h3 className="logout-modal-title">Confirm Logout</h3>
              <button 
                className="logout-modal-close"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
              >
                ×
              </button>
            </div>
            
            <div className="logout-modal-body">
              <p>Are you sure you want to log out?</p>
              <p className="logout-modal-subtext">You'll need to log in again to access your dashboard.</p>
            </div>
            
            <div className="logout-modal-footer">
              <button
                className="logout-modal-cancel"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="logout-modal-confirm"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="logout-modal-spinner"></span>
                    Logging Out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientaccount;