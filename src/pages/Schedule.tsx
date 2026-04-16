import { useState } from 'react';
import { MapPin, FileText, Download, Users, Trophy, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'womens'>('fixtures');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const womensThrowballData = [
    { time: '07:20 AM', event: 'Match 1: Power Smashers Mangalore vs Rukumai Tanda', location: 'Throwball Court' },
    { time: '07:40 AM', event: 'Match 2: Parnikas of Padre vs Shakti Strikers Mangalore', location: 'Throwball Court' },
    { time: '08:00 AM', event: 'Match 3: Thunder Queens (Agalpady) vs Ghate Nidpalli Queens', location: 'Throwball Court' },
    { time: '08:20 AM', event: 'Match 4: Queens Agalpady vs SVR Gundayadka A', location: 'Throwball Court' },
    { time: '08:40 AM', event: 'Break (Lagori Qualifiers)', location: 'Shared Ground' },
    { time: '09:40 AM', event: 'Semi Final 1: Winner Match 1 vs Winner Match 2', location: 'Throwball Court' },
    { time: '10:00 AM', event: 'Semi Final 2: Winner Match 3 vs Winner Match 4', location: 'Throwball Court' },
    { time: '10:20 AM', event: 'Throwball FINAL', location: 'Throwball Court' },
  ];

  const womensLagoriData = [
    { time: '08:00 AM', event: 'Lagori Match 1: Karkala Queens vs Mangalore A', location: 'Shared Ground' },
    { time: '08:20 AM', event: 'Lagori Match 2: Vijaya vs Parnikas of Padre', location: 'Shared Ground' },
    { time: '08:40 AM', event: 'Lagori Match 3: Thunder Queens vs Shakti Strikers', location: 'Shared Ground' },
    { time: '09:00 AM', event: 'Lagori Match 4: Queens Agalpady vs Team C Mangalore', location: 'Shared Ground' },
    { time: '09:20 AM', event: 'Lagori Match 5: SVR Gundayadka A vs Ghate Nidpalli', location: 'Shared Ground' },
    { time: '09:40 AM', event: 'Dodgeball Match 1: Mangalore Queens C vs Karkala Queens', location: 'Shared Ground' },
    { time: '09:55 AM', event: 'Dodgeball Match 2: Mangalore Rising Stars vs SVR Gundayadka B', location: 'Shared Ground' },
    { time: '10:10 AM', event: 'Break (Watch Throwball Final)', location: 'Main Arena' },
    { time: '10:40 AM', event: 'Lagori Semi Final 1', location: 'Shared Ground' },
    { time: '11:00 AM', event: 'Lagori Semi Final 2', location: 'Shared Ground' },
    { time: '11:20 AM', event: 'Lagori FINAL', location: 'Shared Ground' },
    { time: '11:40 AM', event: 'Dodgeball Match 3: Thunder Queens vs SVR Gundayadka A', location: 'Shared Ground' },
    { time: '12:00 PM', event: 'Cooking Without Fire', location: 'Main Hall', details: 'All registered participants' },
    { time: '12:45 PM', event: 'Dodgeball Match 4: Queens Agalpady vs Ghate Nidpalli Queens', location: 'Shared Ground' },
    { time: '01:00 PM', event: 'Dodgeball Match 5: Team B Mangalore vs Parnikas of Padre', location: 'Shared Ground' },
    { time: '01:15 PM', event: 'Dodgeball Semi Final 1', location: 'Shared Ground' },
    { time: '01:30 PM', event: 'Dodgeball Semi Final 2', location: 'Shared Ground' },
    { time: '01:45 PM', event: 'Dodgeball FINAL', location: 'Shared Ground' },
    { time: '02:00 PM', event: 'Rangoli Event', location: 'Main Hall' },
  ];

  const files = [
    { name: "Avatarana_Playbook.pdf", size: "1.1 MB", type: "pdf", title: "Avatarana 2026 Playbook" },
    { name: "Volleyball_Tournament_Schedule.pdf", size: "524 KB", type: "pdf", title: "Volleyball Fixtures & Rules" },
    { name: "Womens_Playbook.pdf", size: "916 KB", type: "pdf", title: "Women's Events Playbook" },
    { name: "Womens_Schedule.pdf", size: "546 KB", type: "pdf", title: "Women's Specific Schedule" },
  ];

  const images = [
    { url: "/fixtures/Event_Schedule.jpeg", title: "Main Event Timeline" },
    { url: "/fixtures/Cricket_Fixtures.jpeg", title: "Cricket Fixtures" },
    { url: "/fixtures/Women_Sports_Tournaments.jpeg", title: "Women's Snapshot" },
    { url: "/fixtures/Cricket_Snapshot.png", title: "Cricket Guide" },
  ];

  return (
    <div className="page-container" style={{maxWidth: '1000px'}}>
      <div className="section-header center-align">
        <motion.h1 
          className="title" 
          style={{fontSize: '3.5rem', marginBottom: '0.5rem'}}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Event Schedule & Fixtures
        </motion.h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem', fontSize: '1.2rem'}}>
          Complete timeline, playbooks, and match fixtures for Avatarana 2026.
        </p>
        
        <div className="nav-pills">
          <button 
            className={`pill-btn ${activeTab === 'fixtures' ? 'active' : ''}`}
            onClick={() => setActiveTab('fixtures')}
          >
            <Trophy size={18} /> Playbooks & Info
          </button>
          <button 
            className={`pill-btn ${activeTab === 'womens' ? 'active' : ''}`}
            onClick={() => setActiveTab('womens')}
          >
            <Users size={18} /> Women's Fixtures
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'womens' && (
          <motion.div 
            key="womens"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
              
              <div className="glass-card" style={{padding: '2rem'}}>
                <h3 style={{color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem'}}>
                  <Trophy size={24} /> Throwball Court
                </h3>
                <div className="mini-timeline">
                  {womensThrowballData.map((item, i) => (
                    <div key={i} className="mini-item">
                      <span className="mini-time">{item.time}</span>
                      <div className="mini-content">
                        <strong>{item.event}</strong>
                        <span className="mini-location"><MapPin size={12}/> {item.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{padding: '2rem'}}>
                <h3 style={{color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem'}}>
                  <Trophy size={24} /> Lagori & Dodgeball (Shared Ground)
                </h3>
                <div className="mini-timeline">
                  {womensLagoriData.map((item, i) => (
                    <div key={i} className="mini-item">
                      <span className="mini-time">{item.time}</span>
                      <div className="mini-content">
                        <strong>{item.event}</strong>
                        <span className="mini-location"><MapPin size={12}/> {item.location}</span>
                        {item.details && <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block'}}>{item.details}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'fixtures' && (
          <motion.div 
            key="fixtures"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.8rem'}}>Playbooks & Documents</h2>
            <div className="docs-grid">
              {files.map((file, i) => (
                <a href={`/fixtures/${file.name}`} download key={i} className="doc-card glass-card">
                  <FileText size={32} className="icon-primary" style={{color: 'var(--primary)'}} />
                  <div className="doc-info">
                    <h4>{file.title}</h4>
                    <span>{file.size} • PDF Document</span>
                  </div>
                  <Download size={20} className="download-icon" />
                </a>
              ))}
            </div>

            <h2 style={{color: 'var(--text-main)', margin: '3rem 0 1.5rem', fontSize: '1.8rem'}}>Latest Snapshots</h2>
            <div className="gallery-grid">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  className="gallery-item glass-card"
                  onClick={() => setSelectedImage(img.url)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="img-wrapper">
                    <img src={img.url} alt={img.title} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(9, 9, 8, 0.98)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '1rem',
              touchAction: 'none'
            }}
            onClick={() => { setSelectedImage(null); setZoom(1); }}
          >
            {/* Control Bar */}
            <div 
              style={{
                position: 'fixed', bottom: '2.5rem', left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.95), rgba(15, 15, 20, 0.98))',
                backdropFilter: 'blur(20px)',
                padding: '0.8rem 1.8rem',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                zIndex: 10000,
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(218, 93, 101, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Zoom Out"
              >
                <ZoomOut size={22} strokeWidth={2.5} />
              </button>
              
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '0.3rem 0.8rem', 
                borderRadius: '12px',
                color: '#ffffff', 
                fontWeight: 800, 
                fontSize: '0.9rem',
                minWidth: '55px', 
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                {Math.round(zoom * 100)}%
              </div>

              <button 
                onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Zoom In"
              >
                <ZoomIn size={22} strokeWidth={2.5} />
              </button>

              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

              <a 
                href={selectedImage} 
                download 
                style={{ 
                  background: 'var(--primary)', 
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  padding: '0.5rem',
                  borderRadius: '50%',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(218, 93, 101, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                  e.currentTarget.style.color = 'white';
                }}
                title="Download Image"
              >
                <Download size={20} strokeWidth={2.5} />
              </a>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => { setSelectedImage(null); setZoom(1); }}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'white', cursor: 'pointer', padding: '0.75rem',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 10001
              }}
            >
              <X size={28} />
            </button>

            {/* Image Container */}
            <div style={{ 
              width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: zoom }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={selectedImage} 
                alt="Full view" 
                style={{
                  maxWidth: '90%', maxHeight: '90%',
                  objectFit: 'contain', borderRadius: '4px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  cursor: zoom > 1 ? 'grab' : 'default'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .center-align { text-align: center; }
        .nav-pills { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; }
        .pill-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; border-radius: 50px; background: rgba(228, 225, 222, 0.1); border: 2px solid transparent; color: var(--text-main); font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .pill-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 15px rgba(218, 93, 101, 0.3); }

        .mini-timeline { display: flex; flex-direction: column; gap: 1.25rem; }
        .mini-item { display: flex; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
        .mini-item:last-child { border-bottom: none; }
        .mini-time { font-weight: 700; color: var(--primary); min-width: 80px; font-size: 0.95rem; }
        .mini-content { display: flex; flex-direction: column; gap: 0.3rem; }
        .mini-content strong { color: var(--text-main); font-size: 1.05rem; }
        .mini-location { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: var(--muted); }

        .docs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .doc-card { display: flex; align-items: center; padding: 1.5rem; gap: 1.5rem; text-decoration: none; color: inherit; transition: all 0.3s; border: 1px solid transparent; }
        .doc-card:hover { border-color: var(--primary); transform: translateY(-3px); }
        .doc-info { flex: 1; }
        .doc-info h4 { margin: 0 0 0.25rem 0; color: var(--text-main); font-size: 1.1rem; }
        .doc-info span { color: var(--muted); font-size: 0.85rem; }
        .download-icon { color: var(--text-secondary); transition: color 0.3s; }
        .doc-card:hover .download-icon { color: var(--primary); }

        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .gallery-item { overflow: hidden; padding: 0; display: flex; flex-direction: column; border-radius: 14px; }
        .img-wrapper { height: 260px; overflow: hidden; border-radius: 14px; }
        .img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .gallery-item:hover .img-wrapper img { transform: scale(1.08); }

        @media (max-width: 768px) { 
          .mini-item { flex-direction: column; gap: 0.5rem; }
          .mini-time { margin-bottom: 0.25rem; }
        }
      `}</style>
    </div>
  );
}
