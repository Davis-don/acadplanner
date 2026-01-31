import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './header.css';

interface HeaderProps {
  companyName?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    alert("Sidebar will open here later! Implementing with Zustand store.");
  };
  
  const handleLogoClick = () => {
    navigate('/');
  };
  
  const handleNavClick = (path: string) => {
    navigate(`/${path.toLowerCase().replace(' ', '-')}`);
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
        
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={handleMenuClick}
          aria-label="Open sidebar menu"
        >
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;