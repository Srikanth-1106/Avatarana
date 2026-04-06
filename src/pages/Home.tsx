import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight, Sparkles, Heart, Phone, Handshake, ChevronRight, X, Crown, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
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
      const { data, error } = await supabase
        .from('registrations')
        .select('phone, events, team_name');

      if (!error && data) {
        // Deduplicate based on phone + events + team_name (same as AdminDashboard)
        const uniqueRegsMap = new Map();
        data.forEach((reg: any) => {
          const eventStr = Array.isArray(reg.events) ? reg.events.slice().sort().join('|') : String(reg.events || '');
          const key = `${reg.phone}-${eventStr}-${reg.team_name || ''}`;
          if (!uniqueRegsMap.has(key)) {
            uniqueRegsMap.set(key, reg);
          }
        });
        setRegCount(uniqueRegsMap.size);
      } else {
        setRegCount(0);
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
  const [selectedSponsor, setSelectedSponsor] = useState<{ name: string, type: string, value: string, height?: string } | null>(null);




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
    { name: 'Brindavan Samaj', type: 'image', value: '/brindavan-samaj-logo.png', height: '90px' },
    { name: 'Ramakrishna Bhat Kodikanda', type: 'name', value: 'Ramakrishna Bhat Kodikanda' },
    { name: 'Purushothama Bhat M', type: 'name', value: 'Purushothama Bhat M' },
    { name: 'Ananthashayana Bhat Adyethimar', type: 'name', value: 'Ananthashayana Bhat Adyethimar' },
    { name: 'Pushpakumar Ailukunje (Rtd PT Master)', type: 'name', value: 'Pushpakumar Ailukunje (Rtd PT Master)' },
    { name: 'Thara N Bhat Kannetikana', type: 'name', value: 'Thara N Bhat Kannetikana' },
    { name: 'Vishwanath Bhat', type: 'name', value: 'Vishwanath Bhat' },
    { name: 'Manjunatha Bhat Gumpe', type: 'name', value: 'Manjunatha Bhat Gumpe' },
    { name: 'Ganapathi Bhat Balike', type: 'name', value: 'Ganapathi Bhat Balike' },
    { name: 'Sooryanarayana bhat (Kalashraya)', type: 'name', value: 'Sooryanarayana bhat (Kalashraya)' },
    { name: 'Damodara Bhat Kannadka', type: 'name', value: 'Damodara Bhat Kannadka' },
    { name: 'Sunil Angraje', type: 'name', value: 'Sunil Angraje' },
    { name: 'Karada Vishwa Bengaluru', type: 'name', value: 'Karada Vishwa Bengaluru' },
    { name: 'Jayaram Bhat Kuntalpady', type: 'name', value: 'Jayaram Bhat Kuntalpady' },
    { name: 'Chandra Mohana Kannadka', type: 'name', value: 'Chandra Mohana Kannadka' }
  ];



  return (
    <div className="page-container home-page">

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

          <RegistrationCounter />
        </div>
      </AnimatedSection>

      {/* Proud Sponsors Marquee */}
      <AnimatedSection className="community-wall" direction="up">
        <div className="section-header center-align">
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#FCD34D', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(252, 211, 77, 0.4)', flexWrap: 'nowrap', gap: '0.5rem' }}>
            <Crown size={typeof window !== 'undefined' && window.innerWidth < 480 ? 20 : 28} style={{ color: '#FCD34D', filter: 'drop-shadow(0 0 10px rgba(252, 211, 77, 0.6))', flexShrink: 0 }} />
            <span>Premium Sponsors</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', fontFamily: 'Inter', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
            The driving force behind Avatarana 2026
          </p>
        </div>
        <div className="sponsors-marquee-wrapper">
          <div className="sponsors-marquee-track">
            {[...allSponsors, ...allSponsors].map((sponsor, i) => (
              <div key={`sponsor-group-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div 
                  className="sponsor-scroll-item"
                  onClick={() => {
                    setSelectedSponsor(sponsor);
                    confetti({
                      particleCount: 150,
                      spread: 80,
                      origin: { y: 0.5 },
                      colors: ['#FCD34D', '#FFFBEB', '#B45309', '#ffffff'],
                      zIndex: 10000
                    });
                  }}
                >
                  {sponsor.type === 'image' ? (
                    <img
                      src={sponsor.value}
                      alt={sponsor.name}
                      className="sponsor-scroll-img"
                      style={{ maxHeight: sponsor.height || '60px' }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="sponsor-scroll-name">{sponsor.value}</span>
                  )}
                </div>
                {/* Separator star between items */}
                <div className="separator-star">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revamped Premium Sponsor CTA Area */}
        <div className="premium-sponsor-cta" style={{
          position: 'relative',
          marginTop: '5rem',
          padding: '4rem 2rem',
          borderRadius: '32px',
          background: 'radial-gradient(120% 120% at 50% 0%, rgba(244, 63, 94, 0.07) 0%, rgba(9, 9, 8, 0.6) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.15)',
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
            background: 'radial-gradient(ellipse at top, rgba(244, 63, 94, 0.15), transparent 70%)',
            pointerEvents: 'none', zIndex: -1
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '16px', color: 'var(--primary)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <Handshake size={28} />
            </div>
          </div>
          <h3 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: '1rem', color: '#ffffff', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Partner with Avatarana 2026?
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '3.5rem', fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)', textAlign: 'center', maxWidth: '540px', lineHeight: '1.6' }}>
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
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
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
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
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

      {/* Stats Section */}
      <AnimatedSection className="stats-wrapper" direction="up" style={{ marginTop: '5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="section-header center-align" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
            Festival Highlights
          </h2>
          <div className="title-underline" style={{ margin: '0 auto' }}></div>
        </div>
      </AnimatedSection>
      <AnimatedSection className="stats-section" direction="up" staggerChildren={true}>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card">
          <div className="stat-icon-wrapper">
            <Users size={32} color="#F43F5E" />
          </div>
          <h2 className="stat-number">5</h2>
          <p className="stat-label">Categories</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card">
          <div className="stat-icon-wrapper">
            <Trophy size={32} color="#0EA5E9" />
          </div>
          <h2 className="stat-number">{count}+</h2>
          <p className="stat-label">Events</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card">
          <div className="stat-icon-wrapper">
            <Medal size={32} color="#10B981" />
          </div>
          <h2 className="stat-number">All</h2>
          <p className="stat-label">Ages Welcome</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="stat-card">
          <div className="stat-icon-wrapper">
            <CalendarHeart size={32} color="#8B5CF6" />
          </div>
          <h2 className="stat-number">1</h2>
          <p className="stat-label">Community</p>
        </motion.div>
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
              The event includes multiple competitive games and cultural activities designed to bring together participants of all ages. Participants compete either individually or as regional teams, earning points that contribute to their region's championship standing.
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

      {/* Register & Events CTA - Above Footer */}
      <AnimatedSection className="bottom-cta-section" direction="up">
        <div className="hero-actions" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <Link to="/register" className="btn-primary">
            Register Now <ArrowRight size={20} />
          </Link>
          <Link to="/events" className="btn-secondary">
            View Events
          </Link>
        </div>
      </AnimatedSection>

      {/* Sponsor Highlight Modal */}
      <AnimatePresence>
        {selectedSponsor && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSponsor(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(10, 12, 16, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            />
            <motion.div
              layoutId={`sponsor-pop`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="sponsor-modal-content"
            >
              <button
                onClick={() => setSelectedSponsor(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff', transition: 'all 0.2s ease', zIndex: 10 }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <X size={20} />
              </button>

              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FCD34D', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                <Sparkles size={16} fill="currentColor" /> Proud Sponsor
              </div>

              {selectedSponsor.type === 'image' ? (
                <div className="sponsor-modal-image-wrapper">
                  <img
                  src={selectedSponsor.value}
                  alt={selectedSponsor.name}
                  loading="lazy"
                  style={{ maxHeight: selectedSponsor.height || 'auto' }}
                />
                </div>
              ) : (
                <h3 className="sponsor-modal-title">
                  {selectedSponsor.value}
                </h3>
              )}

              <p style={{ color: '#a1a1aa', marginTop: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '90%' }}>
                Thank you to <strong style={{ color: '#ffffff' }}>{selectedSponsor.name}</strong> for powering the biggest sports festival of 2026.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
