import { Trophy, Medal, Star } from 'lucide-react';

export default function Leaderboard() {
  const regions = [
    { name: 'Mangalore South', points: 145, position: 1 },
    { name: 'Udupi', points: 120, position: 2 },
    { name: 'Puttur', points: 95, position: 3 },
    { name: 'Mangalore North', points: 82, position: 4 },
  ];

  return (
    <div className="page-container" style={{maxWidth: '800px'}}>
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Regional Leaderboard</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>Live Championship Standings for AVATARANA 2026</p>
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      <div className="leaderboard glass-card">
        <div className="table-header">
          <div className="col rank">Rank</div>
          <div className="col region">Region</div>
          <div className="col pts">Total Points</div>
        </div>
        
        <div className="table-body">
          {regions.map((region) => (
            <div key={region.name} className={`table-row ${region.position === 1 ? 'first' : ''}`}>
              <div className="col rank">
                {region.position === 1 && <Trophy className="icon-primary" size={24} />}
                {region.position === 2 && <Medal className="icon-secondary" size={24} />}
                {region.position === 3 && <Medal className="icon-tertiary" size={24} />}
                {region.position > 3 && <span className="position-number">{region.position}</span>}
              </div>
              <div className="col region">
                <span className="region-name">{region.name}</span>
                {region.position === 1 && <span className="badge-champ"><Star size={12}/> Champion Spot</span>}
              </div>
              <div className="col pts">
                <span className="points-value">{region.points}</span>
                <span className="points-label">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .center-align { text-align: center; }
        .leaderboard {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }
        .table-header {
          display: flex;
          padding: 1.5rem 2rem;
          background: rgba(15, 15, 14, 0.5);
          border-bottom: 1px solid rgba(228, 225, 222, 0.1);
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.875rem;
        }
        .table-row {
          display: flex;
          padding: 1.5rem 2rem;
          align-items: center;
          border-bottom: 1px solid rgba(228, 225, 222, 0.05);
          transition: background 0.2s;
        }
        .table-row:hover {
          background: rgba(228, 225, 222, 0.02);
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .table-row.first {
          background: rgba(218, 93, 101, 0.05);
        }
        .col.rank { width: 80px; display: flex; justify-content: center; }
        .col.region { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .col.pts { width: 120px; text-align: right; }
        
        .position-number { font-size: 1.25rem; font-weight: 700; color: var(--muted); }
        .region-name { font-size: 1.25rem; font-weight: 600; color: var(--text-main); }
        .badge-champ { 
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase;
        }
        .points-value { font-size: 1.75rem; font-weight: 800; color: var(--primary); }
        .points-label { font-size: 0.875rem; color: var(--muted); margin-left: 0.25rem; }

        @media (max-width: 600px) {
          .table-header, .table-row { padding: 1rem; }
          .col.rank { width: 40px; }
          .col.pts { width: 80px; }
        }
      `}</style>
    </div>
  );
}
