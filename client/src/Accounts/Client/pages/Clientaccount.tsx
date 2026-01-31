// Clientaccount.tsx
import './clientaccount.css';
import { useState } from 'react';
import DashboardContent from '../components/Dashboardcontent';
import TimetablesContent from '../components/Timetablecontent';
import ProfileContent from '../components/Profilecontent';
import Walletbalance from '../components/Walletbalance';

// Define the type for navigation items
type NavItem = {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  badge?: number;
};

function Clientaccount() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Navigation items configuration
  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      component: DashboardContent,
      badge: 3
    },
    { 
      id: 'timetables', 
      label: 'Timetables', 
      icon: '⏰', 
      component: TimetablesContent 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤', 
      component: ProfileContent 
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      icon: '🚪', 
      component: DashboardContent // Using Dashboard as placeholder
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (id === 'logout') {
      alert('Logout functionality will be implemented soon!');
      return;
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || DashboardContent;

  return (
    <div className="clac-overall-container">
      
      {/* Header */}
      <header className="clac-header">
        <div className="clac-header-left">
          <button 
            className="clac-hamburger-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="clac-hamburger-icon">☰</span>
          </button>
          <div className="clac-company-name">AcadPlanner Pro</div>
        </div>
        
        <div className="clac-header-right">
          {/* Wallet Balance in Header */}
          <Walletbalance />
          
          <div className="clac-user-info">
            <div className="clac-avatar">JD</div>
            <span className="clac-user-name">John Doe</span>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div 
        className={`clac-mobile-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Layout */}
      <div className="clac-main-layout">
        
        {/* Sidebar Navigation */}
        <aside className={`clac-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="clac-sidebar-header">
            <h2 className="clac-sidebar-title">Navigation</h2>
          </div>
          
          <nav className="clac-nav-container">
            <ul className="clac-nav-list">
              {navItems.map((item) => (
                <li key={item.id} className="clac-nav-item">
                  <button
                    className={`clac-nav-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <span className="clac-nav-icon">{item.icon}</span>
                    <span className="clac-nav-label">{item.label}</span>
                  
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="clac-content-area">
          <div className="clac-content-header">
            <h1 className="clac-content-title">
              {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="clac-content-subtitle">
              {activeTab === 'dashboard' && 'Overview of your academic planning activities'}
              {activeTab === 'timetables' && 'Manage and view your timetables'}
              {activeTab === 'profile' && 'Update your personal information and settings'}
            </p>
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
    </div>
  );
}

export default Clientaccount;