import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../components/AnimatedSection';
import confetti from 'canvas-confetti';

// SVG Ring Component
const CountdownRing = ({ value, label, total }: { value: number; label: string; total: number }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  // Progress logic
  const strokeDashoffset = circumference - (value / total) * circumference;

  return (
    <div className="countdown-ring-container">
      <svg className="countdown-svg" viewBox="0 0 80 80">
        <circle
          className="countdown-bg-ring"
          cx="40" cy="40" r={radius}
        />
        <motion.circle
          className="countdown-progress-ring"
          cx="40" cy="40" r={radius}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="countdown-content">
        <span className="countdown-value">{value}</span>
        <span className="countdown-label">{label}</span>
      </div>
    </div>
  );
};

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
    <div className="countdown-container rings-layout">
      <CountdownRing value={timeLeft.days} label="Days" total={365} />
      <CountdownRing value={timeLeft.hours} label="Hours" total={24} />
      <CountdownRing value={timeLeft.minutes} label="Mins" total={60} />
      <CountdownRing value={timeLeft.seconds} label="Secs" total={60} />
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
  const [selectedSponsor, setSelectedSponsor] = useState<{ type: 'image' | 'name', value: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 20) {
        setCount(count + 1);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count]);

  const imageSponsors = [
    "/sponsor-1.png",
    "/sponsor-2.png",
    "/sponsor-3.png"
  ];

  const namedSponsors = [
    'Bayar Valaya',
    'Kashisadana',
    'Mediglobe Chandrashekar',
    'Venkateshanna',
    'Seethakanthanna Darbe',
    'Nandakishore Bajithotti',
    'Vishwakumar Kayargadde',
    'Raveesh Majakkar',
    'Khadyas',
  ];

  const allSponsors = [
    ...imageSponsors.map(src => ({ type: 'image' as const, value: src })),
    ...namedSponsors.map(name => ({ type: 'name' as const, value: name }))
  ];

  const handleSponsorClick = (sponsor: { type: 'image' | 'name', value: string }) => {
    setSelectedSponsor(sponsor);

    // Trigger celebration effect
    const colors = ['#dc5d65', '#5c9e9c', '#e4e1de'];

    // Initial burst from center
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 10000
    });
  };

  return (
    <div className="page-container home-page">
      {/* Sponsor Modal Overlay — tap again to dismiss */}
      {selectedSponsor && (
        <div className="shoutout-modal-overlay" onClick={() => setSelectedSponsor(null)}>
          <div className="shoutout-modal-card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {selectedSponsor.type === 'image' ? (
              <div className="brand-logo-wrapper" style={{ margin: '0 auto 1.5rem', width: 'fit-content', background: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem' }}>
                <img src={selectedSponsor.value} alt="Sponsor Logo" style={{ maxWidth: '300px', width: '100%', height: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.2)' }} />
              </div>
            ) : (
              <div className="brand-logo-wrapper sponsor-name-marquee" style={{ margin: '0 auto 1.5rem', width: 'fit-content', background: '#ffffff', borderRadius: '16px', padding: '1.5rem 2.5rem' }}>
                <span className="sponsor-name-text" style={{ fontSize: '1.4rem' }}>{selectedSponsor.value}</span>
              </div>
            )}
            <span className="modal-hint">Tap anywhere to close</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <AnimatedSection className="hero-section" direction="up">
        <div className="hero-content-inner">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="badge"
          >
            AVATARANA 2026
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="title"
          >
            One Arena. One Community.<br /><span className="highlight">Endless Excitement.</span>
          </motion.h1>

          <CountdownTimer />

          <p className="subtitle single-line">
            Join the biggest community sports festival. Compete, celebrate, and create unforgettable memories.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Register Now <ArrowRight size={20} />
            </Link>
            <Link to="/events" className="btn-secondary">
              View Events
            </Link>
          </div>

          <RegistrationCounter />
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection className="stats-section" direction="up" staggerChildren={true}>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card glass-card">
          <Users className="icon-secondary" size={40} />
          <h2 className="stat-number">5</h2>
          <p className="stat-label">Categories</p>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card glass-card">
          <Trophy className="icon-primary" size={40} />
          <h2 className="stat-number">{count}+</h2>
          <p className="stat-label">Events</p>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card glass-card">
          <Medal className="icon-tertiary" size={40} />
          <h2 className="stat-number">All</h2>
          <p className="stat-label">Ages Welcome</p>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card glass-card">
          <CalendarHeart className="icon-secondary" size={40} />
          <h2 className="stat-number">1</h2>
          <p className="stat-label">Community</p>
        </motion.div>
      </AnimatedSection>

      {/* Proud Sponsors Marquee */}
      <AnimatedSection className="community-wall" direction="up">
        <div className="section-header center-align">
          <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} style={{ marginRight: '0.75rem', fill: 'var(--primary)', opacity: 0.9 }} />
            Proud Sponsors
          </h2>
        </div>
        <div className="marquee-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="marquee">
            {/* Top row: Left to Right scroll natively */}
            {[...allSponsors, ...allSponsors].map((sponsor, i) => (
              <div key={`sponsor-top-${i}`} className="sponsor-marquee-card" onClick={() => handleSponsorClick(sponsor)}>
                {sponsor.type === 'image' ? (
                  <div className="brand-logo-wrapper" style={{ margin: 0, height: '100%' }}>
                    <img src={sponsor.value} alt="Sponsor" className="sponsor-marquee-img" />
                  </div>
                ) : (
                  <div className="brand-logo-wrapper sponsor-name-marquee" style={{ margin: 0, height: '100%' }}>
                    <span className="sponsor-name-text">{sponsor.value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="marquee marquee-reverse">
            {/* Bottom row: Right to Left scroll reversed */}
            {[...allSponsors, ...allSponsors].map((sponsor, i) => (
              <div key={`sponsor-bottom-${i}`} className="sponsor-marquee-card" onClick={() => handleSponsorClick(sponsor)}>
                {sponsor.type === 'image' ? (
                  <div className="brand-logo-wrapper" style={{ margin: 0, height: '100%' }}>
                    <img src={sponsor.value} alt="Sponsor" className="sponsor-marquee-img" />
                  </div>
                ) : (
                  <div className="brand-logo-wrapper sponsor-name-marquee" style={{ margin: 0, height: '100%' }}>
                    <span className="sponsor-name-text">{sponsor.value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Intro Section */}
      <AnimatedSection className="intro-section" direction="up">
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
      </AnimatedSection>

      {/* Brand Mention */}
      <AnimatedSection className="brand-mention" direction="up">
        <a href="https://aapaavani.com/" target="_blank" rel="noopener noreferrer" className="brand-link">
          <div className="brand-content">
            <div className="brand-logo-container">
              <span className="brand-supported-label">Supported by</span>
              <div className="brand-logo-wrapper">
                <img
                  src="/sponsor-logo-custom.png"
                  alt="Aapaavani Environmental Solutions"
                  className="brand-logo-img"
                />
              </div>
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
      </AnimatedSection>
    </div>
  );
}
