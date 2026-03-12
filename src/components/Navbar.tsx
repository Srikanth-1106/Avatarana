import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Points', path: '/points' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Trophy className="icon-primary" size={28} />
          <span className="logo-text">AVATARANA '26</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links desktop-only">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/register" className="btn-primary nav-btn">Register</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle mobile-only"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/register" 
            className="btn-primary mobile-btn"
            onClick={() => setIsOpen(false)}
          >
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}
