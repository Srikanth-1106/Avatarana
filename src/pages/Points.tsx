import { Award, Trophy, Users } from 'lucide-react';

export default function PointsSystem() {
  return (
    <div className="page-container">
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Championship Points</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>How we rank the regions across AVATARANA 2026</p>
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      <div className="points-grid">
        <div className="glass-card points-card">
          <Users size={48} className="icon-secondary mb-4" />
          <h2>Group Events</h2>
          <p className="points-desc">Points are directly awarded to the team's region.</p>
          <ul className="points-list">
            <li className="first-place">
              <span className="pos">1st Place</span>
              <span className="pts text-primary">10 Pts</span>
            </li>
            <li className="second-place">
              <span className="pos">2nd Place</span>
              <span className="pts text-secondary">5 Pts</span>
            </li>
          </ul>
        </div>

        <div className="glass-card points-card">
          <Award size={48} className="icon-tertiary mb-4" />
          <h2>Individual Events</h2>
          <p className="points-desc">Points contribute to the participant's respective region.</p>
          <ul className="points-list">
            <li className="first-place">
              <span className="pos">1st Place</span>
              <span className="pts text-primary">5 Pts</span>
            </li>
            <li className="second-place">
              <span className="pos">2nd Place</span>
              <span className="pts text-secondary">3 Pts</span>
            </li>
            <li className="third-place">
              <span className="pos">3rd Place</span>
              <span className="pts text-muted">2 Pts</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="rules-section glass-card">
        <h3><Trophy className="inline-icon" /> Important Rules</h3>
        <ul className="rules-list">
          <li><strong>Group event points</strong> are awarded to the team's region. Multiple teams from the same region can participate, but only placing teams score.</li>
          <li><strong>Individual event points</strong> contribute directly to the participant’s region.</li>
          <li><strong>3rd place points</strong> exist only for individual events. Group events only award 1st and 2nd place.</li>
          <li>The <strong>Overall Regional Champion</strong> will be crowned at the closing ceremony based on the aggregate score.</li>
        </ul>
      </div>

      <style>{`
        .mb-4 { margin-bottom: 1rem; }
        .text-primary { color: var(--primary); font-weight: 800; font-size: 1.5rem; }
        .text-secondary { color: var(--secondary); font-weight: 700; font-size: 1.25rem; }
        .text-muted { color: var(--muted); font-weight: 600; font-size: 1.125rem; }
        .center-align { text-align: center; }
        .inline-icon { display: inline; vertical-align: middle; color: var(--primary); margin-right: 0.5rem; }
        
        .points-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .points-card {
          text-align: center;
        }
        .points-desc {
          color: var(--muted);
          margin-bottom: 2rem;
        }
        .points-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .points-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          background: rgba(15,15,14,0.3);
          border: 1px solid rgba(228, 225, 222, 0.05);
        }
        .points-list .pos {
          font-weight: 600;
          font-size: 1.125rem;
        }
        
        .rules-section h3 {
          font-size: 1.75rem;
          margin: 0 0 1.5rem;
          color: var(--text-main);
        }
        .rules-list {
          margin: 0;
          padding-left: 1.5rem;
          color: var(--text-main);
          opacity: 0.9;
        }
        .rules-list li {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .rules-list li:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .points-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
