import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './hero.css';

interface HeroProps {
  companyName?: string;
}

const Hero: React.FC<HeroProps> = () => {
  const navigate = useNavigate();
  const [animatedItems, setAnimatedItems] = useState<boolean[]>([false, false, false]);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  // Demo video URL (replace with your actual demo video)
  const demoVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Example video

  useEffect(() => {
    const timers = animatedItems.map((_, index) => {
      return setTimeout(() => {
        setAnimatedItems(prev => {
          const newItems = [...prev];
          newItems[index] = true;
          return newItems;
        });
      }, index * 300);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleStartPlanning = () => {
    navigate('/login');
  };

  const handleWatchDemo = () => {
    setShowVideoModal(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setIsVideoLoaded(false);
    document.body.style.overflow = 'auto'; // Restore scroll
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showVideoModal) {
        handleCloseVideoModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showVideoModal]);

  return (
    <>
      <section className="acadplanner-hero-section">
        {/* Background Elements */}
        <div className="acadplanner-hero-background">
          <div className="acadplanner-hero-bg-shape acadplanner-bg-shape-1"></div>
          <div className="acadplanner-hero-bg-shape acadplanner-bg-shape-2"></div>
          <div className="acadplanner-hero-bg-shape acadplanner-bg-shape-3"></div>
        </div>

        <div className="acadplanner-hero-container">
          <div className="acadplanner-hero-content">
            {/* Main Headline */}
            <div className="acadplanner-hero-headline">
              <h1 className="acadplanner-hero-title">
                <span className="acadplanner-hero-title-line acadplanner-hero-title-primary">
                  Revolutionize Your
                </span>
                <span className="acadplanner-hero-title-line acadplanner-hero-title-secondary">
                  Academic Planning
                </span>
              </h1>
              
              <p className="acadplanner-hero-subtitle">
                Create, manage, and optimize timetables, schemes of work, and CBE assessments 
                with our intelligent academic planning platform designed for modern educators.
              </p>
            </div>

            {/* Animated Feature Showcase */}
            <div className="acadplanner-hero-features">
              {/* Feature 1: Timetable Creation */}
              <div className={`acadplanner-hero-feature ${animatedItems[0] ? 'acadplanner-feature-visible' : ''}`}>
                <div className="acadplanner-feature-icon-wrapper">
                  <div className="acadplanner-feature-icon acadplanner-feature-icon-timetable">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M14 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M26 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="10" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="2"/>
                      <line x1="10" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="10" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="10" y1="30" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="16" cy="24" r="1.5" fill="currentColor"/>
                      <circle cx="20" cy="24" r="1.5" fill="currentColor"/>
                      <circle cx="24" cy="24" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="acadplanner-feature-content">
                  <h3 className="acadplanner-feature-title">Smart Timetable Creation</h3>
                  <p className="acadplanner-feature-description">
                    Auto-generate conflict-free timetables with drag-and-drop customization
                  </p>
                </div>
              </div>

              {/* Feature 2: Schemes of Work */}
              <div className={`acadplanner-hero-feature ${animatedItems[1] ? 'acadplanner-feature-visible' : ''}`}>
                <div className="acadplanner-feature-icon-wrapper">
                  <div className="acadplanner-feature-icon acadplanner-feature-icon-schemes">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28 10H12C10.8954 10 10 10.8954 10 12V28C10 29.1046 10.8954 30 12 30H28C29.1046 30 30 29.1046 30 28V12C30 10.8954 29.1046 10 28 10Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M14 14H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 18H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 22H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 26H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M24 22L30 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M24 26L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="acadplanner-feature-content">
                  <h3 className="acadplanner-feature-title">Schemes of Work Builder</h3>
                  <p className="acadplanner-feature-description">
                    Design comprehensive lesson plans with curriculum-aligned templates
                  </p>
                </div>
              </div>

              {/* Feature 3: CBE Assessments */}
              <div className={`acadplanner-hero-feature ${animatedItems[2] ? 'acadplanner-feature-visible' : ''}`}>
                <div className="acadplanner-feature-icon-wrapper">
                  <div className="acadplanner-feature-icon acadplanner-feature-icon-cbe">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 10L25 15L20 20L15 15L20 10Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M30 15L35 20L30 25L25 20L30 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M10 15L15 20L10 25L5 20L10 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M20 20L25 25L20 30L15 25L20 20Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="20" cy="20" r="2" fill="currentColor"/>
                      <circle cx="30" cy="20" r="2" fill="currentColor"/>
                      <circle cx="10" cy="20" r="2" fill="currentColor"/>
                      <circle cx="20" cy="30" r="2" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="acadplanner-feature-content">
                  <h3 className="acadplanner-feature-title">CBE Assessment Tools</h3>
                  <p className="acadplanner-feature-description">
                    Competency-based evaluation system with automated progress tracking
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="acadplanner-hero-actions">
              <button 
                className="acadplanner-hero-btn acadplanner-hero-btn-primary"
                onClick={handleStartPlanning}
              >
                <span className="acadplanner-hero-btn-text">Start Planning Free</span>
                <span className="acadplanner-hero-btn-icon">→</span>
              </button>
              <button 
                className="acadplanner-hero-btn acadplanner-hero-btn-secondary"
                onClick={handleWatchDemo}
              >
                <span className="acadplanner-hero-btn-text">Watch Demo</span>
                <span className="acadplanner-hero-btn-icon">▶</span>
              </button>
            </div>

            {/* Stats Section */}
            <div className="acadplanner-hero-stats">
              <div className="acadplanner-hero-stat">
                <div className="acadplanner-stat-number">500+</div>
                <div className="acadplanner-stat-label">Educators Trust</div>
              </div>
              <div className="acadplanner-hero-stat">
                <div className="acadplanner-stat-number">85%</div>
                <div className="acadplanner-stat-label">Time Saved</div>
              </div>
              <div className="acadplanner-hero-stat">
                <div className="acadplanner-stat-number">24/7</div>
                <div className="acadplanner-stat-label">Cloud Access</div>
              </div>
            </div>
          </div>

          {/* Animated Visual Element */}
          <div className="acadplanner-hero-visual">
            <div className="acadplanner-visual-container">
              {/* Floating elements representing academic planning */}
              <div className="acadplanner-floating-element acadplanner-floating-1">
                <div className="acadplanner-floating-icon">📅</div>
              </div>
              <div className="acadplanner-floating-element acadplanner-floating-2">
                <div className="acadplanner-floating-icon">📚</div>
              </div>
              <div className="acadplanner-floating-element acadplanner-floating-3">
                <div className="acadplanner-floating-icon">🎯</div>
              </div>
              <div className="acadplanner-floating-element acadplanner-floating-4">
                <div className="acadplanner-floating-icon">📊</div>
              </div>
              
              {/* Main visual card */}
              <div className="acadplanner-visual-card">
                <div className="acadplanner-visual-card-header">
                  <div className="acadplanner-visual-card-dots">
                    <span className="acadplanner-visual-card-dot acadplanner-dot-red"></span>
                    <span className="acadplanner-visual-card-dot acadplanner-dot-yellow"></span>
                    <span className="acadplanner-visual-card-dot acadplanner-dot-green"></span>
                  </div>
                </div>
                <div className="acadplanner-visual-card-content">
                  <div className="acadplanner-visual-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="acadplanner-visual-grid-item">
                        <div className="acadplanner-visual-grid-bar" style={{ height: `${30 + i * 10}%` }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="acadplanner-visual-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="acadplanner-video-modal-overlay" onClick={handleCloseVideoModal}>
          <div 
            className="acadplanner-video-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="acadplanner-video-modal-header">
              <h3 className="acadplanner-video-modal-title">AcadPlanner Demo</h3>
              <button 
                className="acadplanner-video-modal-close"
                onClick={handleCloseVideoModal}
                aria-label="Close video modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="acadplanner-video-modal-content">
              {!isVideoLoaded && (
                <div className="acadplanner-video-loading">
                  <div className="acadplanner-video-loading-spinner"></div>
                  <p className="acadplanner-video-loading-text">Loading demo video...</p>
                </div>
              )}
              
              <iframe
                className={`acadplanner-video-iframe ${isVideoLoaded ? 'acadplanner-video-loaded' : ''}`}
                src={`${demoVideoUrl}?autoplay=1&rel=0&modestbranding=1`}
                title="AcadPlanner Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            </div>
            
            <div className="acadplanner-video-modal-footer">
              <p className="acadplanner-video-modal-description">
                Watch how AcadPlanner simplifies academic planning, timetable creation, and assessment management.
              </p>
              <button 
                className="acadplanner-video-modal-action-btn"
                onClick={handleStartPlanning}
              >
                Try It Free Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;