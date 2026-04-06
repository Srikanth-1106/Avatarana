import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, AlertTriangle, Users, Star, Smile, Heart, Zap } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';

/* ─── Rule Data ─── */
const generalRules = [
  "All participants must be of the Karada Community — either the father or the mother must belong to the Karada community.",
  "A participant can register in only one Zone for any event.",
  "Participants must complete registration with full details before 08-04-2026.",
  "Age categories must be strictly adhered to.",
  "Decisions of the Umpires, Referees, and Organizers are final and binding.",
  "Any team or player who misbehaves or uses abusive language will be immediately disqualified.",
  "Players are expected to uphold the spirit of sportsmanship and show respect towards all."
];

const sections = [
  {
    id: 'general',
    title: 'General Guidelines',
    icon: <AlertTriangle size={22} />,
    accent: '#F43F5E',
    isGeneral: true,
  },
  {
    id: 'mens',
    title: "Men's Events",
    icon: <Users size={22} />,
    accent: '#3B82F6',
    events: [
      { name: 'Cricket', tag: 'First 16 Teams', rules: [
        'Maximum 15 players per squad. Player details mandatory at registration.',
        'League format — 4 overs per match using Vickey Cricket Tennis Ball.',
        'Max 1 over per bowler. No power-play. Max 5 fielders outside circle.',
        'All No-balls result in a Free Hit. Super Over only in post-league stages.',
      ]},
      { name: 'Volleyball', rules: [
        '6 players on court, max squad 9. Best-of-3 sets to 15 points.',
        'Max 3 consecutive hits per side. Service rotation strictly followed.',
      ]},
      { name: 'Tug of War', rules: [
        '8 players per team. Best of 3 pulls.',
        'Sitting or falling deliberately is strictly prohibited.',
      ]},
      { name: 'Lagori', rules: ['7 players per team. Report 20 min early.'] },
    ],
  },
  {
    id: 'womens',
    title: "Women's Events",
    icon: <Star size={22} />,
    accent: '#F59E0B',
    events: [
      { name: 'Throwball', rules: [
        '7 on court, max squad 9. Best-of-3 sets to 21 points (win by 2).',
        'Ball must be thrown (not punched). Max 3 seconds holding time.',
      ]},
      { name: 'Dodgeball', rules: [
        '8 on court. Best-of-3 rounds (max 5 min each).',
        'Headshots eliminate the thrower. Crossing centre line = out.',
      ]},
      { name: 'Lemon & Spoon', rules: [
        'Individual race. If lemon falls, stop, replace, then continue.',
      ]},
      { name: 'Rangoli', rules: [
        '2-player event. 45-min time limit. Stencils & flowers prohibited.',
      ]},
      { name: 'Lagori', rules: ['7 players per team.'] },
    ],
  },
  {
    id: 'kids',
    title: "Kids' Events",
    icon: <Smile size={22} />,
    accent: '#10B981',
    events: [
      { name: 'LKG – 1st Std', rules: ['Bucket Ball (3 attempts)', 'Coloring (30 min)', '50m Race'] },
      { name: '2nd – 5th Std', rules: ['100m Race', 'Lemon & Spoon', 'Drawing (45 min, theme on-spot)'] },
      { name: '6th – 10th Std', rules: ['Drawing (theme on-spot)', 'Lagori (7 players)', 'Maida Coin'] },
    ],
  },
  {
    id: 'seniors',
    title: "Senior Citizens'",
    icon: <Heart size={22} />,
    accent: '#8B5CF6',
    events: [
      { name: 'Speed Walk', rules: ['100m walking race. No jogging. One foot on ground always.'] },
      { name: 'Padabandha', rules: ['Word puzzle. First 3 correct solvers win.'] },
    ],
  },
  {
    id: 'fun',
    title: 'Fun Events',
    icon: <Zap size={22} />,
    accent: '#EC4899',
    events: [
      { name: 'Treasure Hunt', rules: [
        'Teams of 3–5. Do not tamper with clues.',
        'First team to find the treasure wins.',
      ]},
      { name: 'Cooking Without Fire', rules: [
        'Max 2 per team. 1 hour. No heating of any kind.',
        'Cutting done on-spot only. Biscuits, cakes, chocolates NOT allowed.',
      ]},
    ],
  },
];

/* ─── Accordion Item ─── */
const AccordionItem = ({ section }: { section: typeof sections[0] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      marginBottom: '1rem',
      borderRadius: '20px',
      border: `1px solid ${open ? section.accent + '40' : 'rgba(255,255,255,0.08)'}`,
      background: 'linear-gradient(145deg, rgba(20, 22, 28, 0.95), rgba(12, 14, 18, 0.98))',
      overflow: 'hidden',
      transition: 'border-color 0.3s ease',
      boxShadow: open ? `0 8px 32px ${section.accent}15` : '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: `${section.accent}15`,
          border: `1px solid ${section.accent}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: section.accent,
          flexShrink: 0,
        }}>
          {section.icon}
        </div>
        <span style={{
          flex: 1,
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          letterSpacing: '0.02em',
        }}>
          {section.title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            color: 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 1.5rem 1.5rem 1.5rem',
              borderTop: `1px solid rgba(255,255,255,0.05)`,
            }}>
              {/* Accent Bar */}
              <div style={{
                width: '40px',
                height: '3px',
                borderRadius: '2px',
                background: section.accent,
                margin: '1.25rem 0',
                opacity: 0.6,
              }} />

              {section.isGeneral ? (
                /* General Rules - Numbered List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {generalRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                      <span style={{
                        flexShrink: 0,
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: `${section.accent}12`,
                        border: `1px solid ${section.accent}25`,
                        color: section.accent,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                      }}>
                        {idx + 1}
                      </span>
                      <p style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: '0.95rem',
                        lineHeight: 1.8,
                        margin: 0,
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Event-Based Sections */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {(section as any).events?.map((event: any, idx: number) => (
                    <div key={idx}>
                      {/* Event Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: section.accent,
                          boxShadow: `0 0 8px ${section.accent}60`,
                          flexShrink: 0,
                        }} />
                        <h3 style={{
                          color: '#ffffff',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          margin: 0,
                          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}>
                          {event.name}
                        </h3>
                        {event.tag && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: section.accent,
                            background: `${section.accent}15`,
                            border: `1px solid ${section.accent}30`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {event.tag}
                          </span>
                        )}
                      </div>

                      {/* Event Rules */}
                      <div style={{
                        borderLeft: '2px solid rgba(255,255,255,0.06)',
                        paddingLeft: '1rem',
                        marginLeft: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}>
                        {event.rules.map((rule: string, rIdx: number) => (
                          <p key={rIdx} style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.9rem',
                            lineHeight: 1.75,
                            margin: 0,
                            fontFamily: "'Inter', system-ui, sans-serif",
                          }}>
                            {rule}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ─── Main Page ─── */
export default function Rules() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050508',
      position: 'relative',
      paddingBottom: '4rem',
    }}>
      {/* Ambient top glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse at top, rgba(244, 63, 94, 0.12), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <AnimatedSection>
        <div style={{
          paddingTop: '120px',
          paddingBottom: '2rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '120px 1.5rem 2rem',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: '100px',
            padding: '0.4rem 1rem',
            marginBottom: '1.5rem',
            color: '#F43F5E',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}>
            <AlertTriangle size={14} /> Official Regulations
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 1rem 0',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            Rule Book
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1rem',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 auto 2rem',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Tap any section below to expand the official rules for Avatarana 2026.
          </p>

          {/* Hero Download Button — always visible on arrival */}
          <a
            href="/Avatarana_2026_Rulebook.pdf"
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
              color: '#ffffff',
              padding: '0.85rem 2rem',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
              boxShadow: '0 8px 28px rgba(244, 63, 94, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              letterSpacing: '0.02em',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 14px 36px rgba(244, 63, 94, 0.55)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(244, 63, 94, 0.4)';
            }}
          >
            <Download size={20} />
            Download Full PDF
          </a>

          <p style={{
            marginTop: '0.75rem',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '0.04em',
          }}>
            Or read below ↓
          </p>

        </div>
      </AnimatedSection>

      {/* Accordion list */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {sections.map((section, idx) => (
          <AnimatedSection key={section.id} direction="up" delay={idx * 0.08}>
            <AccordionItem section={section} />
          </AnimatedSection>
        ))}
      </div>

      {/* Static Download Section — above footer */}
      <AnimatedSection direction="up" delay={0.1}>
        <div style={{
          maxWidth: '680px',
          margin: '2.5rem auto 0',
          padding: '0 1rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            borderRadius: '24px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.07) 0%, rgba(12, 14, 18, 0.9) 100%)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
          }}>
            <div>
              <p style={{
                margin: '0 0 0.25rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
              }}>
                Official Rulebook
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                Save the full PDF for offline reference
              </p>
            </div>
            <a
              href="/Avatarana_2026_Rulebook.pdf"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                color: '#ffffff',
                padding: '0.8rem 1.75rem',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                boxShadow: '0 6px 24px rgba(244, 63, 94, 0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(244, 63, 94, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(244, 63, 94, 0.35)';
              }}
            >
              <Download size={18} />
              Download PDF
            </a>
          </div>
        </div>
      </AnimatedSection>

    </div>
  );
}
