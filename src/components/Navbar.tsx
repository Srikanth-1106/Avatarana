import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu, X, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const location = useLocation();

  const messages = [
    "You discovered the Avatarana Spirit!",
    "The Arena awaits you! 🏆",
    "Unity in Community! 🤝",
    "Excellence is in our DNA! ✨"
  ];

  const triggerConfetti = useCallback(() => {
    const colors = ['#dc5d65', '#5c9e9c', '#e4e1de'];
    
    // Initial burst on top of modal
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.5 },
      colors: colors,
      zIndex: 10000
    });

    // Side cannons for 2 seconds
    const end = Date.now() + 2000;
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        zIndex: 10000
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        zIndex: 10000
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
  };

  useEffect(() => {
    // Reset click count if too much time passes between clicks
    if (clickCount > 0) {
      const resetTimer = setTimeout(() => setClickCount(0), 500); // 500ms window
      return () => clearTimeout(resetTimer);
    }
  }, [clickCount]);

  useEffect(() => {
    if (clickCount >= 2) {
      setShowEasterEgg(true);
      setClickCount(0);
      triggerConfetti();
      
      // Synchronized removal: exactly 2 seconds to match confetti
      const timer = setTimeout(() => {
        setShowEasterEgg(false);
        setMessageIndex(prev => (prev + 1) % messages.length);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [clickCount, messages.length, triggerConfetti]);

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
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={handleLogoClick}>
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

      {showEasterEgg && (
        <div className="modal-overlay" onClick={() => setShowEasterEgg(false)}>
          <div className="celebratory-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
              <PartyPopper size={40} />
            </div>
            <h2 className="modal-title">Spirit Unlocked!</h2>
            <p className="modal-message">
              <Sparkles size={20} className="icon-primary" style={{marginRight: '0.5rem', display: 'inline'}} />
              {messages[messageIndex]}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
