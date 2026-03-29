import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight, Sparkles, Heart, Phone, Handshake, ChevronRight } from 'lucide-react';
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
        setRegCount(count); 
      } else {
        setRegCount(0); 
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="reg-counter-badge">
      <Sparkles size={18} />
      <span>Registrations: {regCount} and counting!</span>
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

  type SponsorItem = { name: string; type: 'image' | 'name'; value: string; height?: string };
  const allSponsors: SponsorItem[] = [
    { name: 'Aapaavani', type: 'image', value: '/sponsor-logo-custom-removebg-preview.png', height: '90px' },
    { name: 'Kashi Sadana', type: 'name', value: 'Kashi Sadana' },
    { name: 'Brindavan Samaj', type: 'image', value: '/brindavan-samaj-logo.png', height: '90px' }
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
              <div className="brand-logo-wrapper" style={{ margin: '0 auto 1.5rem', width: 'fit-content', background: 'var(--white)', borderRadius: '16px', padding: '1.5rem 2rem' }}>
                <img src={selectedSponsor.value} alt="Sponsor Logo" style={{ maxWidth: '300px', width: '100%', height: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.2)' }} />
              </div>
            ) : (
              <div className="brand-logo-wrapper sponsor-name-marquee" style={{ margin: '0 auto 1.5rem', width: 'fit-content', background: 'var(--white)', borderRadius: '16px', padding: '1.5rem 2.5rem' }}>
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
        <div className="static-sponsors-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', gap: '2.5rem', margin: '3.5rem 0' }}>
          {allSponsors.map((sponsor, i) => (
            <div 
              key={`sponsor-static-${i}`} 
              className="premium-sponsor-card" 
              onClick={() => handleSponsorClick({ type: sponsor.type, value: sponsor.value })}
              style={{ 
                margin: 0, 
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: sponsor.type === 'name' ? '2rem 3rem' : '1.5rem 2.5rem',
                minWidth: '240px',
                minHeight: '130px',
                borderRadius: '24px',
                background: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.borderColor = 'rgba(218, 93, 101, 0.4)';
                e.currentTarget.style.boxShadow = '0 15px 45px rgba(218, 93, 101, 0.15), inset 0 0 0 1px rgba(255,255,255,0.1)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
              }}
            >
              {sponsor.type === 'image' ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img 
                    src={sponsor.value} 
                    alt={sponsor.name} 
                    style={{ 
                      maxHeight: sponsor.height || '75px', 
                      width: 'auto', 
                      maxWidth: '220px', 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.4))'
                    }} 
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '1.45rem', 
                    fontWeight: 800, 
                    color: '#000000', 
                    letterSpacing: '1px', 
                    lineHeight: '1.2',
                    textTransform: 'uppercase'
                  }}>
                    {sponsor.value}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revamped Premium Sponsor CTA Area */}
        <div style={{
          position: 'relative',
          marginTop: '5rem',
          padding: '4rem 2rem',
          borderRadius: '32px',
          background: 'radial-gradient(120% 120% at 50% 0%, rgba(218, 93, 101, 0.07) 0%, rgba(10, 10, 10, 0.6) 100%)',
          border: '1px solid rgba(218, 93, 101, 0.15)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 10
        }}>
          {/* Ambient Background Glows */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-10%', width: '120%', height: '100%',
            background: 'radial-gradient(ellipse at top, rgba(218, 93, 101, 0.15), transparent 70%)',
            pointerEvents: 'none', zIndex: -1
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(218, 93, 101, 0.15)', borderRadius: '16px', color: 'var(--primary)', border: '1px solid rgba(218, 93, 101, 0.2)' }}>
              <Handshake size={28} />
            </div>
          </div>
          <h3 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#ffffff', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Partner with Avatarana 2026?
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '3.5rem', fontSize: '1.15rem', textAlign: 'center', maxWidth: '540px', lineHeight: '1.6' }}>
            Join our monumental sports festival. Connect with thousands of passionate participants and amplify your brand's reach.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '0.5rem', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--primary)', fontWeight: 700 }}>
              Official Coordinators
            </div>
            
            <a href="tel:+919482974619" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }} onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
              e.currentTarget.style.backgroundColor = 'rgba(218, 93, 101, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(218, 93, 101, 0.3)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(218, 93, 101, 0.15)';
            }} onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'rgba(218, 93, 101, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(218, 93, 101, 0.2)' }}>
                  <Phone size={22} fill="currentColor" opacity={0.6} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                  <span style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 600 }}>Shrivathsa Gumpe</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    +91 94829 74619
                  </span>
                </div>
              </div>
              <ChevronRight size={22} color="var(--primary)" opacity={0.8} />
            </a>

            <a href="tel:+919686199746" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }} onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
              e.currentTarget.style.backgroundColor = 'rgba(218, 93, 101, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(218, 93, 101, 0.3)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(218, 93, 101, 0.15)';
            }} onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: 'rgba(218, 93, 101, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(218, 93, 101, 0.2)' }}>
                  <Phone size={22} fill="currentColor" opacity={0.6} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                  <span style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 600 }}>Kiran Sajangadde</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    +91 96861 99746
                  </span>
                </div>
              </div>
              <ChevronRight size={22} color="var(--primary)" opacity={0.8} />
            </a>
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
                  src="/sponsor-logo-custom-removebg-preview.png"
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
