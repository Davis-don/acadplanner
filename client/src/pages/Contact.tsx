// Updated Contact.jsx component
import './contact.css';

function Contact() {
  const phoneNumber = '0758420860';
  const fullPhoneNumber = '+254758420860'; // Kenya country code
  
  // Function to handle WhatsApp click
  const handleWhatsAppClick = () => {
    const message = 'Hello! I need assistance with...';
    const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Function to handle phone call
  const handlePhoneClick = () => {
    window.location.href = `tel:${fullPhoneNumber}`;
  };

  // Function to handle phone call with local format
  const handleLocalPhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Function to handle email click
  const handleEmailClick = () => {
    window.location.href = 'mailto:davismugoikou@gmail.com?subject=Support Request&body=Hello, I need assistance with...';
  };

  return (
    <div className="contact-hero-wrapper">
      <div className="contact-container">
        
        {/* Hero Section */}
        <section className="contact-hero">
          <h1 className="contact-hero-title">Quick Support When You Need It Most</h1>
          <p className="contact-hero-subtitle">
            Technical issues? Service problems? We're here to help you resolve them fast
          </p>
        </section>

        {/* Services We Help With */}
        <section className="contact-services">
          <h2 className="contact-services-title">Issues We Solve</h2>
          
          <div className="contact-services-grid">
            <div className="contact-service-card">
              <div className="contact-service-icon">🛠️</div>
              <h3>Technical Help</h3>
              <p>Platform issues, login problems, feature troubleshooting, and system errors</p>
            </div>
            
            <div className="contact-service-card">
              <div className="contact-service-icon">💳</div>
              <h3>Payment Issues</h3>
              <p>Service paid but delivery failed, refund requests, and transaction problems</p>
            </div>
            
            <div className="contact-service-card">
              <div className="contact-service-icon">🚀</div>
              <h3>Quick Support</h3>
              <p>Immediate assistance for urgent matters affecting your operations</p>
            </div>
          </div>
        </section>

        {/* Contact Channels */}
        <section className="contact-channels">
          <h2 className="contact-channels-title">Get In Touch Instantly</h2>
          
          <div className="contact-channels-grid">
            {/* WhatsApp Card */}
            <div 
              className="contact-channel-card" 
              onClick={handleWhatsAppClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="contact-channel-icon">💬</div>
              <h3>WhatsApp Chat</h3>
              <div className="contact-channel-info">+254 758 420 860</div>
              <span className="contact-channel-action">Chat Now →</span>
            </div>

            {/* Phone Card */}
            <div 
              className="contact-channel-card" 
              onClick={handlePhoneClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="contact-channel-icon">📞</div>
              <h3>Direct Call</h3>
              <div className="contact-channel-info">+254 758 420 860</div>
              <span className="contact-channel-action">Call Now →</span>
            </div>

            {/* Email Card */}
            <div 
              className="contact-channel-card" 
              onClick={handleEmailClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="contact-channel-icon">✉️</div>
              <h3>Email Support</h3>
              <div className="contact-channel-info">davismugoikou@gmail.com</div>
              <span className="contact-channel-action">Send Email →</span>
            </div>
          </div>

          {/* Local format note */}
          <div className="contact-format-note">
            <p>📱 Local format: 0758 420 860 (Kenya)</p>
          </div>
        </section>

        {/* Support Information */}
        <section className="contact-support">
          <h2 className="contact-support-title">Why Choose Our Support?</h2>
          <p className="contact-support-text">
            We understand how critical timely support is. Whether it's technical glitches 
            or service delivery issues, we prioritize your concerns and work swiftly to 
            resolve them.
          </p>
          
          <div className="contact-emergency">
            ⚡ Priority response for urgent issues
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;