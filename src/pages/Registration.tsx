import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Registration() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-container" style={{textAlign: 'center', padding: '6rem 2rem'}}>
        <CheckCircle2 size={80} className="icon-primary" style={{margin: '0 auto 2rem'}} />
        <h1 className="title">Registration Successful!</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>
          Thank you for registering for AVATARANA 2026. Your community region lead will contact you soon.
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">Register Another Participant</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{maxWidth: '800px'}}>
      <div className="section-header">
        <h1 className="title" style={{fontSize: '3rem'}}>Participant Registration</h1>
        <p className="subtitle">Join the championship. Fill out the form below to participate.</p>
        <div className="divider"></div>
      </div>

      <form className="registration-form glass-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" required placeholder="Enter full name" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" required placeholder="+91 xxxxxxxxxx" />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input type="number" id="age" required min="3" max="100" placeholder="Years" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <select id="region" required>
              <option value="">Select your region...</option>
              <option value="mangalore-north">Mangalore North</option>
              <option value="mangalore-south">Mangalore South</option>
              <option value="udupi">Udupi</option>
              <option value="puttur">Puttur</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" required>
              <option value="">Select category...</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Senior">Senior Citizens</option>
              <option value="General">General (Open)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="events">Interested Events (Hold Ctrl/Cmd to select multiple)</label>
          <select id="events" multiple style={{height: '120px'}}>
            <option value="cricket">Cricket</option>
            <option value="volleyball">Volleyball</option>
            <option value="lagori">Lagori</option>
            <option value="tug">Tug of War</option>
            <option value="rangoli">Rangoli</option>
            <option value="dodgeball">Dodgeball</option>
            <option value="run">Running Races</option>
            <option value="cooking">Cooking Without Fire</option>
          </select>
          <small className="hint-text">You can participate in multiple standard and open events.</small>
        </div>

        <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem', padding: '1rem'}}>
          Submit Registration
        </button>
      </form>

      <style>{`
        .registration-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        label {
          font-weight: 500;
          color: var(--text-main);
          font-size: 0.95rem;
        }
        input, select {
          padding: 0.875rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(228, 225, 222, 0.2);
          background: rgba(15, 15, 14, 0.5);
          color: var(--text-main);
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.2s;
        }
        input:focus, select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(218, 93, 101, 0.2);
        }
        select option {
          background: var(--bg-main);
          color: var(--text-main);
        }
        .hint-text {
          color: var(--muted);
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
