import { Link } from 'react-router-dom';
import { Target, Users, Heart, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  const coreValues = [
    {
      icon: <Target className="icon-primary" size={32} />,
      title: "Our Mission",
      desc: "To foster unity and sportsmanship within the Karada community through tradition and modern athletic competition."
    },
    {
      icon: <ShieldCheck className="icon-secondary" size={32} />,
      title: "Our Vision",
      desc: "Creating a lasting heritage of health, cultural bonding, and community pride for the next generation."
    },
    {
      icon: <Users className="icon-tertiary" size={32} />,
      title: "Organizers",
      desc: "Proudly hosted by Youth Karada Mangaluru, a dedicated group committed to community growth."
    }
  ];

  return (
    <div className="page-container about-page">
      {/* Hero Section */}
      <section className="about-hero hero-section">
        <div className="hero-content-inner">
          <div className="badge animate-slide-down">ESTABLISHED 2024</div>
          <h1 className="title">The Heart of<br /><span className="highlight">Avatarana</span></h1>
          <p className="subtitle">
            Avatarana isn't just a sports festival. It's a grand celebration of heritage, unity, and the indomitable spirit of our community.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="section-header">
          <div className="badge" style={{ background: 'rgba(92, 158, 156, 0.1)', color: 'var(--secondary)' }}>OUR STORY</div>
          <h2>Where Tradition Meets Action</h2>
          <div className="divider"></div>
        </div>

        <div className="intro-grid">
          <div className="intro-text">
            <p>
              AVATARANA was born from a simple idea: To bring every member of our community—from eager kids to wise seniors—into one arena. What started as a small gathering has evolved into the biggest community sports festival in the region.
            </p>
            <p>
              Every year, we witness incredible feats of athleticism, but more importantly, we witness the forging of lifelong bonds. Whether it's the intense Tug of War or the strategic mind games, the goal remains the same: Celebrate our collective identity.
            </p>
          </div>
          <div className="intro-visual glass-card animate-pulse-slow">
            <Sparkles className="icon-secondary" size={48} />
            <h3>50+ Events</h3>
            <p>Spanning 2 days of non-stop energy and cultural celebration.</p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="values-grid">
        {coreValues.map((value, index) => (
          <div key={index} className="value-card glass-card">
            <div className="value-icon-wrapper">
              {value.icon}
            </div>
            <h3>{value.title}</h3>
            <p>{value.desc}</p>
          </div>
        ))}
      </section>

      {/* Sustainability Partner Section */}
      <section className="sustainability-section glass-card">
        <div className="sustainability-content">
          <div className="badge" style={{ background: 'rgba(92, 158, 156, 0.2)', color: 'var(--secondary)', marginBottom: '1.5rem' }}>SUSTAINABILITY PARTNER</div>
          <div className="brand-logo-wrapper" style={{ margin: '0 auto 1.5rem', width: 'fit-content' }}>
            <img
              src="/sponsor-logo-custom.png"
              alt="Aapaavani Environmental Solutions"
              className="brand-logo-img"
            />
          </div>
          <p className="brand-mission">
            "Aapaavani builds innovative solutions — including effluent and sewage treatment plants — for dealing with environmental pollutants that plague our urban spaces."
          </p>
          <div className="environmental-tags">
            <span className="tag"><Zap size={14} /> Clean Energy</span>
            <span className="tag"><Heart size={14} /> Sustainable Future</span>
            <span className="tag"><ShieldCheck size={14} /> Eco-Conscious</span>
          </div>
          <a href="https://aapaavani.com/" target="_blank" rel="noopener noreferrer" className="btn-outline">Visit Partner Site</a>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2 className="title" style={{ fontSize: '2.5rem' }}>Ready to make history?</h2>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary">Become a Participant</Link>
          <Link to="/events" className="btn-secondary">Explore Events</Link>
        </div>
      </section>

      <style>{`
        .about-page {
          overflow-x: hidden;
        }

        .about-hero {
          min-height: 50vh;
          padding: 6rem 0;
          overflow: visible;
        }

        .about-hero .subtitle {
          max-width: 100%;
          padding: 0 1rem;
        }

        .story-section {
          padding: 6rem 0;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 4rem 0;
        }

        .value-card {
          text-align: center;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .value-card h3 {
          font-size: 1.2rem;
          margin: 0;
        }

        .value-card p {
          color: var(--muted);
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        .value-icon-wrapper {
          width: 72px;
          height: 72px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sustainability-section {
          margin: 6rem 0;
          padding: 4rem 3rem;
          background: linear-gradient(135deg, rgba(92, 158, 156, 0.1) 0%, rgba(15, 15, 14, 0.95) 100%);
          border: 1px solid rgba(92, 158, 156, 0.2);
          text-align: center;
        }

        .sustainability-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .brand-mission {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-style: italic;
          color: var(--text-main);
          opacity: 0.9;
          line-height: 1.8;
          margin: 2rem 0;
        }

        .environmental-tags {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(92, 158, 156, 0.1);
          border-radius: 99px;
        }

        .about-cta {
          text-align: center;
          padding: 6rem 0;
          background: radial-gradient(circle at center, rgba(218, 93, 101, 0.05) 0%, transparent 70%);
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .about-hero {
            min-height: auto;
            padding: 3rem 0 2rem;
          }

          .about-hero .title {
            font-size: 2rem;
          }

          .about-hero .subtitle {
            font-size: 0.95rem;
            padding: 0 0.5rem;
          }

          .story-section {
            padding: 3rem 0;
          }

          .story-section .section-header h2 {
            font-size: 1.6rem;
          }

          .intro-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .intro-text p {
            font-size: 1rem;
            line-height: 1.7;
          }

          .intro-visual {
            padding: 1.5rem;
          }

          .intro-visual h3 {
            font-size: 1.25rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin: 2rem 0;
          }

          .value-card {
            padding: 1.5rem;
            flex-direction: row;
            text-align: left;
            gap: 1rem;
          }

          .value-card h3 {
            font-size: 1.05rem;
          }

          .value-card p {
            font-size: 0.85rem;
          }

          .value-icon-wrapper {
            width: 56px;
            height: 56px;
            min-width: 56px;
            border-radius: 16px;
          }

          .value-icon-wrapper svg {
            width: 24px;
            height: 24px;
          }

          .sustainability-section {
            margin: 3rem 0;
            padding: 2rem 1.25rem;
          }

          .brand-name {
            font-size: 1.25rem !important;
          }

          .brand-mission {
            font-size: 0.95rem;
            margin: 1rem 0;
            line-height: 1.6;
          }

          .environmental-tags {
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .tag {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }

          .about-cta {
            padding: 3rem 0 4rem;
          }

          .about-cta .title {
            font-size: 1.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}
