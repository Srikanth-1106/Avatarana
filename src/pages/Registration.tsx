import { useState } from 'react';
import { CheckCircle2, User, Phone, Calendar, MapPin, Grid, Trophy, Sparkles, Check, Info, Loader2 } from 'lucide-react';
import { eventsData } from '../data/eventsData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Registration() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    region: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      alert("Please select at least one event.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('registrations')
        .insert([
          {
            user_id: user?.id || null, // Optional if we allow guest registrations
            full_name: formData.name,
            phone: formData.phone,
            age: parseInt(formData.age),
            region: formData.region,
            category: formData.category,
            events: selectedEvents.map(id => {
              const event = eventsData.find(e => e.id === id);
              return event ? `${event.name} (${event.category})` : id;
            })
          }
        ]);

      if (submitError) throw submitError;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  const filteredEvents = eventsData.filter(event => {
    if (!formData.category) return true;
    return event.category === formData.category || event.category === 'General';
  });

  if (submitted) {
    return (
      <div className="page-container success-view">
        <div className="background-decorations">
          <div className="decor-blob blob-1"></div>
          <div className="decor-blob blob-2" style={{background: 'var(--tertiary)'}}></div>
        </div>

        <div className="success-content animate-scale-in">
          <div className="celebration-header">
            <div className="trophy-wrapper">
              <div className="glow-ring"></div>
              <Trophy size={60} className="trophy-icon" />
              <Sparkles className="sparkle s1" />
              <Sparkles className="sparkle s2" />
              <Sparkles className="sparkle s3" />
            </div>
            <h1 className="title highlight">Registration Confirmed!</h1>
            <p className="subtitle">You're officially part of AVATARANA 2026.</p>
          </div>

          <div className="ticket-card glass-card">
            <div className="ticket-header">
              <div className="ticket-type">PARTICIPANT PASS</div>
              <div className="ticket-id">#{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
            </div>
            
            <div className="ticket-body">
              <div className="ticket-info">
                <div className="info-node">
                  <label>NAME</label>
                  <span>{formData.name}</span>
                </div>
                <div className="info-node">
                  <label>REGION</label>
                  <span>{formData.region.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div className="info-row">
                  <div className="info-node">
                    <label>CATEGORY</label>
                    <span>{formData.category}</span>
                  </div>
                  <div className="info-node">
                    <label>AGE</label>
                    <span>{formData.age} Yrs</span>
                  </div>
                </div>
              </div>

              <div className="ticket-divider">
                <div className="notch left"></div>
                <div className="dash-line"></div>
                <div className="notch right"></div>
              </div>

              <div className="ticket-events">
                <label><Grid size={14} /> REGISTERED EVENTS</label>
                <div className="event-pills">
                  {selectedEvents.map(id => {
                    const event = eventsData.find(e => e.id === id);
                    return (
                      <span key={id} className="event-pill">
                        {event?.name || id}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="qr-placeholder">
                <CheckCircle2 size={32} />
              </div>
              <div className="footer-text">
                <p>Present this at the registration desk</p>
                <small>Our regional lead will contact you at {formData.phone}</small>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', age: '', region: '', category: '' });
              setSelectedEvents([]);
            }} className="btn-secondary">
              Register Another
            </button>
            <button onClick={() => window.print()} className="btn-outline">
              Print Confirmation
            </button>
          </div>
        </div>

        <style>{`
          .success-view {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 85vh;
            perspective: 1000px;
          }

          .success-content {
            width: 100%;
            max-width: 550px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2.5rem;
            z-index: 1;
          }

          .celebration-header {
            text-align: center;
            animation: fadeInDown 0.8s ease-out;
          }

          .trophy-wrapper {
            position: relative;
            margin-bottom: 1.5rem;
            display: inline-flex;
          }

          .trophy-icon {
            color: #FFD700;
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
            z-index: 2;
          }

          .glow-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse-ring 2s infinite;
          }

          .sparkle {
            position: absolute;
            color: var(--secondary);
            animation: sparkle-float 3s infinite;
            opacity: 0;
          }

          .s1 { top: -10px; left: -20px; animation-delay: 0s; }
          .s2 { top: -20px; right: -10px; animation-delay: 1s; }
          .s3 { bottom: 0; right: -30px; animation-delay: 2s; }

          /* Ticket Styling */
          .ticket-card {
            width: 100%;
            padding: 0;
            overflow: hidden;
            background: rgba(22, 22, 20, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
            animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
          }

          .ticket-header {
            background: linear-gradient(90deg, var(--primary), var(--accent-dark));
            padding: 1.25rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .ticket-type {
            font-weight: 800;
            letter-spacing: 0.1em;
            font-size: 0.8rem;
            color: var(--bg-main);
          }

          .ticket-id {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.5);
            font-size: 0.9rem;
          }

          .ticket-body {
            padding: 2.5rem 2rem;
          }

          .ticket-info {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .info-node label {
            display: block;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--muted);
            letter-spacing: 0.05em;
            margin-bottom: 0.4rem;
          }

          .info-node span {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-main);
          }

          .info-row {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
          }

          .ticket-divider {
            position: relative;
            margin: 2.5rem -2rem;
            display: flex;
            align-items: center;
          }

          .notch {
            width: 40px;
            height: 40px;
            background: var(--bg-main);
            border-radius: 50%;
            position: absolute;
            z-index: 2;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .notch.left { left: -20px; }
          .notch.right { right: -20px; }

          .dash-line {
            width: 100%;
            height: 1px;
            border-bottom: 2px dashed rgba(255, 255, 255, 0.1);
          }

          .ticket-events label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 1rem;
          }

          .event-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
          }

          .event-pill {
            background: rgba(255, 255, 255, 0.05);
            padding: 0.5rem 1rem;
            border-radius: 99px;
            font-size: 0.85rem;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .ticket-footer {
            background: rgba(0, 0, 0, 0.3);
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .qr-placeholder {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
          }

          .footer-text p {
            margin: 0;
            font-weight: 700;
            font-size: 0.9rem;
            color: var(--text-main);
          }

          .footer-text small {
            color: var(--muted);
            font-size: 0.75rem;
          }

          .success-actions {
            display: flex;
            gap: 1rem;
            animation: fadeIn 1s ease-out 0.8s both;
          }

          /* New Animations */
          @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          }

          @keyframes sparkle-float {
            0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
          }

          @keyframes fadeInDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes slideUpFade {
            from { transform: translateY(40px) rotateX(10deg); opacity: 0; }
            to { transform: translateY(0) rotateX(0); opacity: 1; }
          }

          @media (max-width: 600px) {
            .ticket-card { border-radius: 12px; }
            .info-row { grid-template-columns: 1fr; gap: 1rem; }
            .success-actions { flex-direction: column; width: 100%; }
            .success-view { padding: 4rem 1rem; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container registration-page">
      <div className="background-decorations">
        <div className="decor-blob blob-1"></div>
        <div className="decor-blob blob-2"></div>
      </div>

      <div className="section-header">
        <div className="badge animate-slide-down">REGISTRATION OPEN</div>
        <h1 className="title animate-fade-in"><span className="highlight">Join the</span> Championship</h1>
        <p className="subtitle animate-fade-in-delayed">Fill out the details below to secure your spot in AVATARANA 2026.</p>
        <div className="divider"></div>
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-layout-grid">
          {/* Left Column: Personal Info */}
          <div className="form-section glass-card animate-slide-up">
            <h3 className="section-title"><User size={20} /> Personal Information</h3>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  id="name" 
                  required 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    placeholder="+91 xxxxxxxxxx" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input 
                    type="number" 
                    id="age" 
                    required 
                    min="3" 
                    max="100" 
                    placeholder="Years" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <select 
                    id="region" 
                    required
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                  >
                    <option value="">Select region...</option>
                    <option value="mangalore-north">Mangalore North</option>
                    <option value="mangalore-south">Mangalore South</option>
                    <option value="udupi">Udupi</option>
                    <option value="puttur">Puttur</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <div className="input-wrapper">
                  <Grid className="input-icon" size={18} />
                  <select 
                    id="category" 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category...</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Senior Citizens">Senior Citizens</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Events Selection */}
          <div className="form-section glass-card animate-slide-up-delayed">
            <h3 className="section-title"><Trophy size={20} /> Interested Events</h3>
            <p className="section-desc">Select all the events you'd like to participate in. {formData.category ? `Showing events for ${formData.category}.` : "Please select a category first."}</p>
            
            <div className="events-selection-grid">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  className={`event-card ${selectedEvents.includes(event.id) ? 'selected' : ''}`}
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className="event-card-header">
                    <span className="event-type">{event.type}</span>
                    {selectedEvents.includes(event.id) && <Check size={14} className="check-icon" />}
                  </div>
                  <h4 className="event-name">{event.name}</h4>
                  {event.subCategory && <span className="event-subcategory">{event.subCategory}</span>}
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="no-events">
                  <Info size={40} />
                  <p>Choose a category to see available events</p>
                </div>
              )}
            </div>

            <div className="selection-summary">
              {error && <p className="error-message">{error}</p>}
              <span>{selectedEvents.length} events selected</span>
              <button 
                type="submit" 
                className="btn-primary submit-btn"
                disabled={selectedEvents.length === 0 || loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Registration'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .registration-page {
          max-width: 1200px;
          position: relative;
          padding-bottom: 5rem;
        }

        .background-decorations {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .decor-blob {
          position: absolute;
          filter: blur(80px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          right: -100px;
        }

        .blob-2 {
          width: 300px;
          height: 300px;
          background: var(--secondary);
          bottom: 100px;
          left: -100px;
        }

        .form-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .form-section {
          height: fit-content;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          color: var(--primary);
          margin: 0;
        }

        .section-desc {
          font-size: 0.9rem;
          color: var(--muted);
          margin: -1rem 0 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        label {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--muted);
          pointer-events: none;
          transition: color 0.2s;
        }

        input, select {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.8rem;
          border-radius: 12px;
          border: 1px solid rgba(228, 225, 222, 0.1);
          background: rgba(15, 15, 14, 0.4);
          color: var(--text-main);
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus, select:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(15, 15, 14, 0.6);
          box-shadow: 0 0 0 4px rgba(218, 93, 101, 0.15);
        }

        input:focus + .input-icon, select:focus + .input-icon {
          color: var(--primary);
        }

        /* Custom Events Grid */
        .events-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: var(--primary) transparent;
        }

        .events-selection-grid::-webkit-scrollbar {
          width: 4px;
        }

        .events-selection-grid::-webkit-scrollbar-thumb {
          background-color: var(--primary);
          border-radius: 10px;
        }

        .event-card {
          background: rgba(228, 225, 222, 0.05);
          border: 1px solid rgba(228, 225, 222, 0.1);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
          user-select: none;
        }

        .event-card:hover {
          background: rgba(228, 225, 222, 0.08);
          border-color: rgba(218, 93, 101, 0.3);
          transform: translateY(-2px);
        }

        .event-card.selected {
          background: rgba(218, 93, 101, 0.15);
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(218, 93, 101, 0.2);
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .event-type {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          font-weight: 700;
        }

        .check-icon {
          color: var(--primary);
        }

        .event-name {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .event-subcategory {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .no-events {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--muted);
          text-align: center;
          gap: 1rem;
        }

        .selection-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid rgba(228, 225, 222, 0.1);
          margin-top: auto;
        }

        .selection-summary span {
          font-size: 0.9rem;
          color: var(--muted);
          font-weight: 500;
        }

        .submit-btn {
          padding: 0.8rem 2rem;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          margin-right: 1rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Success View Styling */
        .success-view {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
        }

        .success-card {
          text-align: center;
          max-width: 500px;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .success-icon-wrapper {
          position: relative;
          margin-bottom: 1rem;
        }

        .success-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 15px rgba(218, 93, 101, 0.4));
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .sparkle-1, .sparkle-2 {
          position: absolute;
          color: var(--secondary);
          opacity: 0;
          animation: sparkle 2s infinite;
        }

        .sparkle-1 { top: -10px; right: -10px; animation-delay: 0.5s; }
        .sparkle-2 { bottom: 0; left: -20px; animation-delay: 1.2s; }

        .success-details {
          width: 100%;
          background: rgba(15, 15, 14, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 0.85rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-weight: 600;
          color: var(--text-main);
        }

        /* Animations */
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
        }

        .animate-slide-down {
          animation: slideDown 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out 0.3s both;
        }

        .animate-slide-up-delayed {
          animation: slideUp 0.6s ease-out 0.5s both;
        }

        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 900px) {
          .form-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
          .success-card { padding: 3rem 1.5rem; }
        }
      `}</style>
    </div>
  );
}
