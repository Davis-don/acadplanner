// Updated About.jsx component
import './about.css';

function About() {
  return (
    <div className="about-hero-wrapper">
      <div className="about-hero-container">
        
        {/* Hero Section */}
        <section className="about-hero-content">
          <h1 className="about-hero-title">From Classroom Challenges to Smart Solutions</h1>
          <p className="about-hero-subtitle">
            Discover how one teacher's struggle with timetables sparked a revolution in educational management
          </p>
        </section>

        {/* Founder's Story */}
        <section className="about-founder-story">
          <div className="about-story-title">
            <div className="about-story-icon">📚</div>
            <h2 className="about-story-heading">The Problem That Started It All</h2>
          </div>
          
          <div className="about-story-content">
            <div className="about-story-text">
              <p>
                During his years as a dedicated teacher, <strong>Davis Ikou</strong> faced the same frustrating challenge year after year: 
                creating and managing school timetables.
              </p>
              
              <div className="about-problem-highlight">
                <h3 className="about-problem-title">The Timetable Struggle</h3>
                <p>
                  Despite using available tools, Davis found himself spending countless hours—sometimes weeks—working on schedules 
                  that would inevitably need constant adjustments. The process was time-consuming, inefficient, and took away from 
                  what truly mattered: teaching and student engagement.
                </p>
              </div>
              
              <p>
                He realized this wasn't just his problem. Teachers and administrators everywhere were wrestling with the same 
                administrative burdens, preventing them from focusing on their core mission: education.
              </p>
            </div>
            
            <div className="about-founder-visual">
              <div className="about-visual-timeline"></div>
              <div className="about-visual-item">
                <div className="about-visual-icon">👨‍🏫</div>
                <strong>Teacher & Administrator</strong>
                <p>Years of hands-on classroom experience</p>
              </div>
              <div className="about-visual-item">
                <div className="about-visual-icon">⏰</div>
                <strong>Timetable Challenges</strong>
                <p>Struggled with inefficient scheduling tools</p>
              </div>
              <div className="about-visual-item">
                <div className="about-visual-icon">💡</div>
                <strong>Innovation Spark</strong>
                <p>Identified the need for a better solution</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="about-solution-section">
          <h2 className="about-solution-title">The Smart Solution Born from Experience</h2>
          
          <div className="about-solution-grid">
            <div className="about-solution-card">
              <div className="about-solution-icon-wrapper">⚡</div>
              <h4>Lightning-Fast Scheduling</h4>
              <p>Transform hours of work into minutes with intelligent algorithms that understand school needs</p>
            </div>
            
            <div className="about-solution-card">
              <div className="about-solution-icon-wrapper">🎯</div>
              <h4>Focus on What Matters</h4>
              <p>Free teachers and administrators from administrative burdens to concentrate on education</p>
            </div>
            
            <div className="about-solution-card">
              <div className="about-solution-icon-wrapper">🤝</div>
              <h4>Built by Educators</h4>
              <p>Designed with real classroom experience, solving actual problems faced daily</p>
            </div>
          </div>
        </section>

        {/* Founder Info */}
        <section className="about-founder-info">
          <div className="about-founder-grid">
            <div className="about-founder-avatar">
              <div className="about-avatar-image"></div>
              <div className="about-founder-tags">
                <span className="about-founder-tag">Software Engineer</span>
                <span className="about-founder-tag">Systems Expert</span>
                <span className="about-founder-tag">Education Innovator</span>
              </div>
            </div>
            
            <div className="about-founder-details">
              <h3>Davis Ikou</h3>
              <div className="about-founder-role">Founder & Visionary</div>
              
              <div className="about-founder-bio">
                <p>
                  Combining his deep understanding of educational challenges with technical expertise, Davis founded this 
                  platform to solve the very problems he experienced firsthand.
                </p>
                <p>
                  As a seasoned software engineer with expertise in systems architecture, he leads <strong>Kinstry Systems</strong> 
                  while continuing to innovate in educational technology.
                </p>
              </div>
              
              <div className="about-company-highlight">
                <span>🏢</span>
                <div>
                  <strong>Also Founder of Kinstry Systems</strong>
                  <p>Bringing technical excellence to practical solutions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* <section className="about-cta-section">
          <h2 className="about-cta-title">Ready to Transform Your School's Management?</h2>
          <div className="about-cta-buttons">
            <button className="about-cta-button about-cta-primary">
              Start Free Trial
            </button>
            <button className="about-cta-button about-cta-secondary">
              Book a Demo
            </button>
          </div>
        </section> */}
      </div>
    </div>
  );
}

export default About;