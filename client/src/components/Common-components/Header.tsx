import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '../../store/useSidebar';
import './header.css';

interface HeaderProps {
  companyName?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebarStore();
  
  const handleMenuClick = () => {
    toggleSidebar();
  };
  
  const handleLogoClick = () => {
    navigate('/');
  };
  
  const handleNavClick = (path: string) => {
    navigate(`/${path.toLowerCase().replace(' ', '-')}`);
  };
  
  const handleUserClick = () => {
    navigate('/login');
  };
  
  return (
    <header className="overall-header-container">
      <div className="header-content">
        {/* Logo Section */}
        <div className="logo-section" onClick={handleLogoClick}>
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div className="logo-text">
            <h1 className="company-name">
              <span className="logo-word">Acad</span>
              <span className="logo-word">Planner</span>
              <div className="logo-underline"></div>
            </h1>
            <p className="company-tagline">Academic Planning Simplified</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li><button className="nav-link" onClick={() => handleNavClick('')}>Home</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('about')}>About</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('contact')}>Contact</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('signup')}>Create Account</button></li>
            <li><button className="nav-link login-btn" onClick={() => handleNavClick('login')}>Login</button></li>
          </ul>
        </nav>
        
        {/* Mobile Actions */}
        <div className="mobile-actions">
          <button 
            className="mobile-user-btn"
            onClick={handleUserClick}
            aria-label="Go to login"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            className="mobile-menu-btn"
            onClick={handleMenuClick}
            aria-label="Open sidebar menu"
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;