import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Medal, CalendarHeart, ArrowRight, Sparkles, Heart, Phone, Handshake, ChevronRight, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection } from '../components/AnimatedSection';

// ═══ Fireworks Canvas Component ═══
type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; color: string;
  size: number; gravity: number;
  trail: { x: number; y: number }[];
};

const FireworksCanvas = ({ active, onDone }: { active: boolean; onDone: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(false);

  const COLORS = [
    '#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF922B',
    '#CC5DE8','#F06595','#20C997','#74C0FC','#FFA94D',
    '#FF8787','#63E6BE','#A9E34B','#FFD43B','#845EF7',
  ];

  const createBurst = useCallback((cx: number, cy: number) => {
    const count = 80 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 3 + Math.random() * 7;
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 2.5 + Math.random() * 3,
        gravity: 0.06 + Math.random() * 0.04,
        trail: [],
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesRef.current = [];
    startedRef.current = true;

    // Fire multiple bursts
    const burstPositions = [
      { x: canvas.width * 0.25, y: canvas.height * 0.35 },
      { x: canvas.width * 0.75, y: canvas.height * 0.35 },
      { x: canvas.width * 0.5, y: canvas.height * 0.25 },
      { x: canvas.width * 0.15, y: canvas.height * 0.55 },
      { x: canvas.width * 0.85, y: canvas.height * 0.55 },
    ];

    burstPositions.forEach((pos, i) => {
      setTimeout(() => createBurst(pos.x, pos.y), i * 180);
    });
    setTimeout(() => {
      burstPositions.forEach((pos, i) => {
        setTimeout(() => createBurst(pos.x + (Math.random()-0.5)*120, pos.y + (Math.random()-0.5)*80), i * 120);
      });
    }, 600);

    let done = false;
    const animate = () => {
      if (!startedRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;
      let allFaded = true;
      for (let p of ps) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= 0.012;
        if (p.alpha > 0) {
          allFaded = false;
          // Trail
          for (let t = 0; t < p.trail.length; t++) {
            ctx.beginPath();
            ctx.arc(p.trail[t].x, p.trail[t].y, p.size * (t / p.trail.length) * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor((p.alpha * (t / p.trail.length)) * 99).toString(16).padStart(2, '0');
            ctx.fill();
          }
          // Main particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
          // Sparkle glow
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      particlesRef.current = ps.filter(p => p.alpha > 0);
      if (allFaded && ps.length > 0 && !done) {
        done = true;
        onDone();
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      startedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, createBurst, onDone]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        pointerEvents: 'none', width: '100vw', height: '100vh',
      }}
    />
  );
};

// ═══ Sponsor Modal ═══
type SponsorItem = { name: string; type: 'image' | 'name'; value: string; height?: string };

const SponsorModal = ({ sponsor, onClose }: { sponsor: SponsorItem | null; onClose: () => void }) => {
  useEffect(() => {
    if (!sponsor) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sponsor, onClose]);

  return (
    <AnimatePresence>
      {sponsor && (
        <motion.div
          key="sponsor-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            key="sponsor-card"
            initial={{ scale: 0.5, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '480px', width: '100%',
              borderRadius: '28px',
              padding: '3rem 2.5rem',
              background: 'linear-gradient(145deg, rgba(30,32,36,0.98) 0%, rgba(18,19,22,0.98) 100%)',
              border: '1.5px solid rgba(218,93,101,0.35)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(218,93,101,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Ambient glow top */}
            <div style={{
              position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
              width: '320px', height: '160px',
              background: 'radial-gradient(ellipse, rgba(218,93,101,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Close btn */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(218,93,101,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              <X size={16} />
            </button>

            {/* Star icon */}
            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
              style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'rgba(218,93,101,0.15)',
                border: '1px solid rgba(218,93,101,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              {sponsor.type === 'image' ? (
                <img src={sponsor.value} alt={sponsor.name}
                  style={{ maxHeight: '52px', maxWidth: '52px', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'contrast(1.2)' }}
                />
              ) : (
                <Star size={32} fill="currentColor" opacity={0.8} />
              )}
            </motion.div>

            {/* Thank you label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '-0.5rem',
              }}
            >
              🎉 Proud Sponsor
            </motion.div>

            {/* Name */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#fff',
                margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em',
              }}
            >
              {sponsor.name}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}
            >
              Thank you for your generous support in making
              <strong style={{ color: 'rgba(255,255,255,0.8)' }}> Avatarana 2026 </strong>
              a grand celebration for our community! 🏆
            </motion.p>

            {/* Divider */}
            <div style={{ width: '60px', height: '3px', borderRadius: '2px', background: 'var(--primary)', opacity: 0.6 }} />

            {/* Close CTA */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              onClick={onClose}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem 2.5rem',
                borderRadius: '99px',
                background: 'var(--primary)',
                border: 'none', cursor: 'pointer',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(218,93,101,0.4)',
                transition: 'all 0.2s ease',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 6px 28px rgba(218,93,101,0.55)' }}
              whileTap={{ scale: 0.97 }}
            >
              Awesome! 🎊
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


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
        setRegCount(count); // Showing real registration count
      } else {
        setRegCount(0); // Fallback to 0
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
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pendingSponsorRef = useRef<SponsorItem | null>(null);

  const handleSponsorClick = useCallback((sponsor: SponsorItem) => {
    pendingSponsorRef.current = sponsor;
    setFireworksActive(true);
    setShowModal(false);
    setSelectedSponsor(null);
    // After a short burst, show modal
    setTimeout(() => {
      setSelectedSponsor(pendingSponsorRef.current);
      setShowModal(true);
    }, 900);
  }, []);

  const handleFireworksDone = useCallback(() => {
    setFireworksActive(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedSponsor(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 20) {
        setCount(count + 1);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count]);
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
      {/* Fireworks Canvas */}
      <FireworksCanvas active={fireworksActive} onDone={handleFireworksDone} />
      {/* Sponsor Modal */}
      {showModal && <SponsorModal sponsor={selectedSponsor} onClose={handleCloseModal} />}

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
        <div className="sponsors-marquee-wrapper">
          <div className="sponsors-marquee-track" style={{ marginBottom: '1.5rem' }}>
            {[...allSponsors, ...allSponsors].map((sponsor, i) => (
              <div
                key={`sponsor-scroll-top-${i}`}
                className="sponsor-scroll-card sponsor-scroll-card--clickable"
                onClick={() => handleSponsorClick(sponsor)}
                title={`Click to celebrate ${sponsor.name}!`}
              >
                {sponsor.type === 'image' ? (
                  <img
                    src={sponsor.value}
                    alt={sponsor.name}
                    className="sponsor-scroll-img"
                    style={{ maxHeight: sponsor.height || '60px' }}
                  />
                ) : (
                  <span className="sponsor-scroll-name">{sponsor.value}</span>
                )}
              </div>
            ))}
          </div>
          <div className="sponsors-marquee-track-reverse">
            {[...allSponsors, ...allSponsors].reverse().map((sponsor, i) => (
              <div
                key={`sponsor-scroll-bottom-${i}`}
                className="sponsor-scroll-card sponsor-scroll-card--clickable"
                onClick={() => handleSponsorClick(sponsor)}
                title={`Click to celebrate ${sponsor.name}!`}
              >
                {sponsor.type === 'image' ? (
                  <img
                    src={sponsor.value}
                    alt={sponsor.name}
                    className="sponsor-scroll-img"
                    style={{ maxHeight: sponsor.height || '60px' }}
                  />
                ) : (
                  <span className="sponsor-scroll-name">{sponsor.value}</span>
                )}
              </div>
            ))}
          </div>
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
