import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="overall-footer-component">
      <div className="footer-content">
        <div className="copyright-container">
          <div className="copyright-content">
            <p className="copyright">
              © {currentYear} AcadPlanner. All rights reserved.
            </p>
            <p className="created-by">
              Created by{' '}
              <a 
                href="https://www.kinstryx.co.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="company-link"
              >
                Kinstry Systems
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;