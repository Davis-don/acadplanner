import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '../../../store/useSidebar';
import './sidebar.css';

interface SidebarProps {
  companyName?: string;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  
  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && 
          !target.closest('.acadplanner-sidebar-wrapper') && 
          !target.closest('.mobile-menu-btn')) {
        closeSidebar();
      }
    };
    
    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };
    
    // Prevent body scroll when sidebar is open
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen, closeSidebar]);
  
  const handleNavClick = (path: string) => {
    navigate(`/${path.toLowerCase().replace(' ', '-')}`);
    closeSidebar();
  };
  
  const handleLogoClick = () => {
    navigate('/');
    closeSidebar();
  };
  
  const sidebarNavItems = [
    { label: 'Home', icon: '🏠', path: '' },
    { label: 'About', icon: 'ℹ️', path: 'about' },
    { label: 'Contact', icon: '📞', path: 'contact' },
    { label: 'Create Account', icon: '✨', path: 'signup' },
    { label: 'Login', icon: '🔐', path: 'login' },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`acadplanner-sidebar-backdrop ${isSidebarOpen ? 'acadplanner-backdrop-visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      
      {/* Sidebar Wrapper */}
      <aside 
        className={`acadplanner-sidebar-wrapper ${isSidebarOpen ? 'acadplanner-sidebar-visible' : ''}`}
        aria-label="Main navigation sidebar"
        aria-hidden={!isSidebarOpen}
      >
        {/* Sidebar Container */}
        <div className="acadplanner-sidebar-container">
          {/* Sidebar Header */}
          <div className="acadplanner-sidebar-header">
            <div className="acadplanner-sidebar-brand" onClick={handleLogoClick}>
              <div className="acadplanner-sidebar-logo">
                <div className="acadplanner-sidebar-logo-icon">
                  <svg width="44" height="44" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 20H90V100H30V20Z" fill="url(#bookGradient)" stroke="var(--primary-color)" strokeWidth="3"/>
                    <path d="M30 40H90" stroke="var(--primary-light)" strokeWidth="2"/>
                    <path d="M30 60H90" stroke="var(--primary-light)" strokeWidth="2"/>
                    <path d="M30 80H90" stroke="var(--primary-light)" strokeWidth="2"/>
                    <path d="M25 20L60 5L95 20L60 35L25 20Z" fill="url(--secondary-gradient)"/>
                    <path d="M60 35L60 50" stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round"/>
                    <rect x="35" y="25" width="4" height="15" fill="var(--accent-color)" rx="2"/>
                    <rect x="45" y="25" width="4" height="20" fill="var(--secondary-color)" rx="2"/>
                    <rect x="55" y="25" width="4" height="25" fill="var(--primary-color)" rx="2"/>
                    <circle cx="75" cy="30" r="2" fill="var(--success-color)"/>
                    <circle cx="82" cy="30" r="2" fill="var(--warning-color)"/>
                    <circle cx="89" cy="30" r="2" fill="var(--error-color)"/>
                  </svg>
                </div>
                <div className="acadplanner-sidebar-brand-text">
                  <h2 className="acadplanner-sidebar-brand-name">
                    <span className="acadplanner-sidebar-brand-word-acad">Acad</span>
                    <span className="acadplanner-sidebar-brand-word-planner">Planner</span>
                  </h2>
                  <p className="acadplanner-sidebar-brand-tagline">Academic Planning Simplified</p>
                </div>
              </div>
            </div>
            
            <button 
              className="acadplanner-sidebar-close"
              onClick={closeSidebar}
              aria-label="Close sidebar menu"
            >
              <span className="acadplanner-sidebar-close-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="acadplanner-sidebar-divider">
            <span className="acadplanner-sidebar-divider-text">Navigation</span>
          </div>
          
          {/* Main Navigation */}
          <nav className="acadplanner-sidebar-nav">
            <ul className="acadplanner-sidebar-nav-list">
              {sidebarNavItems.map((item, index) => (
                <li key={item.label} className="acadplanner-sidebar-nav-item">
                  <button 
                    className={`acadplanner-sidebar-nav-link ${item.label === 'Login' ? 'acadplanner-sidebar-nav-login' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <span className="acadplanner-sidebar-nav-icon">{item.icon}</span>
                    <span className="acadplanner-sidebar-nav-label">{item.label}</span>
                    <span className="acadplanner-sidebar-nav-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Footer */}
          <footer className="acadplanner-sidebar-footer">
            <div className="acadplanner-sidebar-footer-content">
              <p className="acadplanner-sidebar-footer-text">Academic Planning Tool for Teachers</p>
              <button 
                className="acadplanner-sidebar-footer-btn"
                onClick={() => handleNavClick('contact')}
              >
                <span className="acadplanner-sidebar-footer-icon">💬</span>
                Get Help
              </button>
            </div>
            <div className="acadplanner-sidebar-footer-version">
              <span className="acadplanner-sidebar-version-text">v2.1.0</span>
              <span className="acadplanner-sidebar-copyright">© 2024 AcadPlanner</span>
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;