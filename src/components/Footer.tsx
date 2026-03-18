export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="footer-title">AVATARANA 2026</h3>
          <p className="footer-tagline">One Arena. One Community. Endless Excitement.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/events">Events</a></li>
            <li><a href="/schedule">Schedule</a></li>
            <li><a href="/points">Points System</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Organized By</h4>
          <div className="brand-logo-wrapper" style={{ margin: '0.5rem 0', width: 'fit-content', background: '#ffffff', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Youth Karada Mangaluru" style={{ height: '32px', width: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.1)' }} />
          </div>
          <p>Youth Karada Mangaluru</p>
          <a href="/contact" className="contact-link">Contact Us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Youth Karada Mangaluru. All rights reserved.</p>
      </div>
    </footer>
  );
}
