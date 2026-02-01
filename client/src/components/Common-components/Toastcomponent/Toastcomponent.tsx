import './toastcomponent.css'
import { useToast } from '../../../store/useToaststore';
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaInfo, FaClock } from 'react-icons/fa';

function Toastcomponent() {
  const { message, type, duration, color, clearToast, isMounted } = useToast();
  const [progress, setProgress] = useState(100);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [iconScale, setIconScale] = useState(0);

  useEffect(() => {
    if (!isMounted) return;

    // Animate icon on mount
    setIconScale(0);
    setTimeout(() => setIconScale(1), 100);

    // Calculate progress and remaining time
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = 100 - (elapsed / (duration * 1000)) * 100;
      const newRemaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setProgress(newProgress);
      setRemainingTime(newRemaining);
      
      if (now < endTime) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    const animationFrame = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isMounted, duration]);

  if (!isMounted || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="toast-icon success-icon" style={{ transform: `scale(${iconScale})` }} />;
      case 'error':
        return <FaTimes className="toast-icon error-icon" style={{ transform: `scale(${iconScale})` }} />;
      case 'info':
      default:
        return <FaInfo className="toast-icon info-icon" style={{ transform: `scale(${iconScale})` }} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      case 'info':
      default:
        return 'Information';
    }
  };

  return (
    <div className="overall-toast-component-container">
      <div className="toast-backdrop" onClick={clearToast}></div>
      
      <div 
        className={`toast-card ${type}`}
        style={{ 
          '--toast-color': color ?? undefined,
        } as React.CSSProperties}
      >
        {/* Decorative background elements */}
        <div className="toast-bg-elements">
          <div className="bg-orb orb-1"></div>
          <div className="bg-orb orb-2"></div>
        </div>
        
        {/* Toast Header */}
        <div className="toast-header">
          <div className="toast-icon-container">
            {getIcon()}
            <div className="icon-glow"></div>
          </div>
          
          <div className="toast-title-section">
            <h3 className="toast-title">{getTitle()}</h3>
            <div className="toast-timer">
              <FaClock className="timer-icon" />
              <span>{remainingTime}s</span>
            </div>
          </div>
          
          <button 
            className="toast-close-btn"
            onClick={clearToast}
            aria-label="Close toast"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Toast Message */}
        <div className="toast-body">
          <p className="toast-message">{message}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="toast-progress">
          <div 
            className="progress-bar"
            style={{ 
              width: `${progress}%`,
              backgroundColor: color ?? undefined
            }}
          >
            <div className="progress-glow"></div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="toast-actions">
          <button 
            className="toast-action-btn"
            onClick={clearToast}
          >
            Dismiss
          </button>
          {type === 'error' && (
            <button 
              className="toast-action-btn primary"
              onClick={() => {
                // Add retry logic here if needed
                clearToast();
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Toastcomponent;