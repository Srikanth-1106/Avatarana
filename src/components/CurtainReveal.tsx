import { useState, useCallback, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import './CurtainReveal.css';

interface CurtainRevealProps {
  onComplete: () => void;
}

// Fire a rich celebration burst
function fireCelebration() {
  const colors = ['#DA5D65', '#B91A24', '#5C9E9C', '#F4F1EE', '#FFD700', '#FF6B6B'];

  // Big center burst
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors,
    startVelocity: 45,
    gravity: 0.8,
    ticks: 300,
    zIndex: 999999,
  });

  // Left side burst
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      startVelocity: 40,
      zIndex: 999999,
    });
  }, 200);

  // Right side burst
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      startVelocity: 40,
      zIndex: 999999,
    });
  }, 400);

  // Second wave — star shapes from top
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 160,
      origin: { x: 0.5, y: 0.2 },
      colors,
      shapes: ['star'],
      scalar: 1.4,
      startVelocity: 30,
      gravity: 0.5,
      ticks: 250,
      zIndex: 999999,
    });
  }, 700);

  // Third wave — gentle rain
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 180,
      origin: { x: 0.5, y: 0 },
      colors,
      startVelocity: 15,
      gravity: 0.4,
      ticks: 400,
      zIndex: 999999,
    });
  }, 1200);
}

export default function CurtainReveal({ onComplete }: CurtainRevealProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'welcome' | 'fading' | 'done'>('idle');

  // Generate random particle values once (not during render)
  // eslint-disable-next-line react-hooks/purity
  const particleStyles = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    return Array.from({ length: 20 }).map(() => ({
      // eslint-disable-next-line react-hooks/purity
      left: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      top: Math.random() * 100,
      // eslint-disable-next-line react-hooks/purity
      delay: Math.random() * 2,
      // eslint-disable-next-line react-hooks/purity
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  // Lock body scroll while intro is active
  useEffect(() => {
    if (phase !== 'done') {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  const handleLaunch = useCallback(() => {
    // Phase 1: Curtains open (2.2s — smoother, slower)
    setPhase('opening');

    // Phase 2: Curtains finished → show welcome + fire celebration
    setTimeout(() => {
      setPhase('welcome');
      fireCelebration();
    }, 2200);

    // Phase 3: After 4s of welcome display, begin fade-out
    setTimeout(() => {
      setPhase('fading');
    }, 6200);

    // Phase 4: Fade-out completes (1s), remove from DOM
    setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
      onComplete();
    }, 7200);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`curtain-overlay ${phase}`} id="curtain-reveal">
      {/* Solid backdrop behind curtains */}
      <div className="curtain-backdrop" />

      {/* Left curtain */}
      <div className="curtain-panel curtain-left">
        <div className="curtain-fabric">
          <div className="curtain-fold fold-1" />
          <div className="curtain-fold fold-2" />
          <div className="curtain-fold fold-3" />
          <div className="curtain-fold fold-4" />
          <div className="curtain-fold fold-5" />
        </div>
        <div className="curtain-fringe" />
        <div className="curtain-rod" />
      </div>

      {/* Right curtain */}
      <div className="curtain-panel curtain-right">
        <div className="curtain-fabric">
          <div className="curtain-fold fold-1" />
          <div className="curtain-fold fold-2" />
          <div className="curtain-fold fold-3" />
          <div className="curtain-fold fold-4" />
          <div className="curtain-fold fold-5" />
        </div>
        <div className="curtain-fringe" />
        <div className="curtain-rod" />
      </div>

      {/* Top valance bar */}
      <div className="curtain-valance" />

      {/* Center content */}
      <div className="curtain-center">
        {phase === 'idle' && (
          <button
            className="curtain-launch-btn"
            onClick={handleLaunch}
            id="curtain-launch-button"
          >
            <span className="launch-icon">▶</span>
            <span className="launch-text">Launch</span>
            <span className="launch-ring" />
            <span className="launch-ring launch-ring-2" />
          </button>
        )}

        {phase !== 'idle' && (
          <div className={`welcome-text ${phase === 'welcome' || phase === 'fading' ? 'show' : ''}`}>
            <div className="welcome-line welcome-line-1">Welcome to</div>
            <div className="welcome-line welcome-line-2">
              <span className="welcome-highlight">Avatarana</span>{' '}
              <span className="welcome-year">2026</span>
            </div>
            <div className="welcome-tagline">One Arena. One Community. Endless Excitement.</div>
          </div>
        )}
      </div>

      {/* Decorative particles */}
      <div className="curtain-particles">
        {particleStyles.map((style, i) => (
          <span
            key={i}
            className="curtain-particle"
            style={{
              left: `${style.left}%`,
              top: `${style.top}%`,
              animationDelay: `${style.delay}s`,
              animationDuration: `${style.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
