import { Link } from 'react-router-dom';

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
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/schedule">Schedule</Link></li>
            <li><Link to="/points">Points System</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Organized By</h4>
          <div className="brand-logo-wrapper" style={{ margin: '0.5rem 0', width: 'fit-content', background: 'var(--white)', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Youth Karada Mangaluru" style={{ height: '32px', width: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.1)' }} />
          </div>
          <p>Youth Karada Mangaluru</p>
          <Link to="/contact" className="contact-link">Contact Us</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Youth Karada Mangaluru. All rights reserved.</p>
      </div>
    </footer>
  );
}
