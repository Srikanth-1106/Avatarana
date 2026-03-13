import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('April 18, 2026 09:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-container">
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.days}</span>
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.hours}</span>
        <span className="countdown-label">Hours</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.minutes}</span>
        <span className="countdown-label">Mins</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.seconds}</span>
        <span className="countdown-label">Secs</span>
      </div>
    </div>
  );
};

// Registration Counter Component
const RegistrationCounter = () => {
  const [regCount, setRegCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setRegCount(count + 214); // Adding user's specific starting number for effect
      } else {
        setRegCount(214); // Fallback
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="reg-counter-badge">
      <Sparkles size={18} />
      <span>Registered Participants: {regCount} and counting!</span>
    </div>
  );
};

export default function Home() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 20) {
        setCount(count + 1);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count]);

  const shoutouts = [
    "Padil zone ready for Tug of War!",
    "Udupi champions incoming! 🏆",
    "Mangalore South is the powerhouse!",
    "Karada Spirit at its best!",
    "Can't wait for April 18th!",
    "Training hard for the 100m sprint!",
    "Avatarana 2026 will be legendary!",
    "Good luck to all participants! 🤝",
    "Puttur zone is bringing the heat!",
    "Team bonding at its finest."
  ];

  return (
    <div className="page-container home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-inner">
          <div className="badge animate-slide-down">AVATARANA 2026</div>
          <h1 className="title">One Arena. One Community.<br/><span className="highlight">Endless Excitement.</span></h1>
          
          <CountdownTimer />
          
          <p className="subtitle single-line">
            Join the biggest community sports festival. Compete, celebrate, and create unforgettable memories.
          </p>
          
          <RegistrationCounter />

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Register Now <ArrowRight size={20} />
            </Link>
            <Link to="/events" className="btn-secondary">
              View Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card glass-card">
          <Users className="icon-secondary" size={40} />
          <h2 className="stat-number">5</h2>
          <p className="stat-label">Categories</p>
        </div>
        <div className="stat-card glass-card">
          <Trophy className="icon-primary" size={40} />
          <h2 className="stat-number">{count}+</h2>
          <p className="stat-label">Events</p>
        </div>
        <div className="stat-card glass-card">
          <Medal className="icon-tertiary" size={40} />
          <h2 className="stat-number">All</h2>
          <p className="stat-label">Ages Welcome</p>
        </div>
        <div className="stat-card glass-card">
          <CalendarHeart className="icon-secondary" size={40} />
          <h2 className="stat-number">1</h2>
          <p className="stat-label">Community</p>
        </div>
      </section>

      {/* Community Wall */}
      <section className="community-wall">
        <div className="section-header center-align">
          <h2 style={{fontSize: '1.5rem', opacity: 0.6}}><MessageCircle size={20} style={{verticalAlign: 'middle', marginRight: '0.5rem'}}/> Community Shoutouts</h2>
        </div>
        <div className="marquee">
          {[...shoutouts, ...shoutouts].map((text, i) => (
            <div key={i} className="shoutout-card">
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section">
        <div className="section-header">
          <h2>About The Festival</h2>
          <div className="divider"></div>
        </div>
        <div className="intro-grid">
          <div className="intro-text">
            <p>
              AVATARANA 2026 is a high-energy community sports festival organized by Youth Karada Mangaluru for members of the Karada community.
            </p>
            <p>
              The event includes multiple competitive games and cultural activities designed to bring together participants of all ages. Participants compete either individually or as regional teams, earning points that contribute to their region’s championship standing.
            </p>
            <ul className="feature-list">
              <li>🏆 Promotes Sportsmanship & Team Spirit</li>
              <li>🤝 Fosters Community Bonding</li>
              <li>🎯 Exciting traditional and modern games</li>
            </ul>
          </div>
          <div className="intro-visual glass-card">
            <div className="pulse-circle"></div>
            <h3>Join the Championship</h3>
            <p>Every point matters. Bring glory to your region!</p>
            <Link to="/points" className="btn-outline">Learn Scoring System</Link>
          </div>
        </div>
      </section>

      {/* Brand Mention */}
      <section className="brand-mention">
        <a href="https://aapaavani.com/" target="_blank" rel="noopener noreferrer" className="brand-link">
          <div className="brand-content">
            <div className="brand-logo-container">
              {/* Logo will be inserted here once located */}
              <span className="brand-name">Supported by Aapaavani Environmental Solutions</span>
            </div>
            <p className="brand-text">
              Aapaavani builds innovative solutions — including effluent and sewage treatment plants — for dealing with environmental pollutants that plague our urban spaces.
            </p>
            <div className="brand-heart">
              <Heart size={16} fill="var(--primary)" />
              <span className="visit-text">Visit Project <Sparkles size={12} /></span>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}
