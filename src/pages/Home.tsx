import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight } from 'lucide-react';

export default function Home() {
  const [count, setCount] = useState(0);

  // Simple animation effect for numbers based on brief
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 20) {
        setCount(count + 1);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="page-container home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-inner">
          <div className="badge">AVATARANA 2026</div>
          <h1 className="title">One Arena. One Community.<br/><span className="highlight">Endless Excitement.</span></h1>
          <p className="subtitle">
            Join the biggest community sports festival featuring exciting competitions for men, women, kids, and senior citizens.
            Compete, celebrate, and create unforgettable memories.
          </p>
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
    </div>
  );
}
