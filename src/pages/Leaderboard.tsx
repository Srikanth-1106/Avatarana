import { useState } from 'react';
import { Trophy, Medal, Star, Map as MapIcon, Users, Target } from 'lucide-react';

export default function Leaderboard() {
  const [view, setView] = useState<'points' | 'registrations'>('registrations');
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const regions = [
    { id: 'ms', name: 'Mangalore South', points: 145, registrations: 86, position: 1 },
    { id: 'ud', name: 'Udupi', points: 120, registrations: 54, position: 2 },
    { id: 'pu', name: 'Puttur', points: 95, registrations: 42, position: 3 },
    { id: 'mn', name: 'Mangalore North', points: 82, registrations: 32, position: 4 },
  ];

  const sortedData = [...regions].sort((a, b) => 
    view === 'points' ? b.points - a.points : b.registrations - a.registrations
  ).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <div className="page-container" style={{maxWidth: '1000px'}}>
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Championship Hub</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>Explore regional competition and live standings.</p>
        
        <div className="timeline-tabs" style={{marginBottom: '3rem'}}>
          <button 
            className={`tab-btn ${view === 'registrations' ? 'active' : ''}`}
            onClick={() => setView('registrations')}
          >
            <Users size={18} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} />
            Pre-Event Registrations
          </button>
          <button 
            className={`tab-btn ${view === 'points' ? 'active' : ''}`}
            onClick={() => setView('points')}
          >
            <Target size={18} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} />
            Live Point Tracker
          </button>
        </div>
        
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      {/* Visual Zone Map */}
      <div className="zone-grid animate-fade-in">
        {regions.map((region) => (
          <div 
            key={region.id} 
            className={`zone-tile ${activeZone === region.id ? 'active' : ''} glass-card`}
            onClick={() => setActiveZone(activeZone === region.id ? null : region.id)}
          >
            <MapIcon size={24} className="icon-secondary" style={{marginBottom: '0.75rem'}} />
            <h4>{region.name}</h4>
            <div className="zone-stat">
              {view === 'points' ? `${region.points} pts` : `${region.registrations} members`}
            </div>
            {activeZone === region.id && (
              <div className="animate-scale-in" style={{marginTop: '1rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600}}>
                Click for details
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="leaderboard glass-card" style={{marginTop: '2rem'}}>
        <div className="table-header">
          <div className="col rank">Rank</div>
          <div className="col region">Region</div>
          <div className="col pts">
            {view === 'points' ? 'Total Points' : 'Registrations'}
          </div>
        </div>
        
        <div className="table-body">
          {sortedData.map((region) => (
            <div key={region.id} className={`table-row ${region.rank === 1 ? 'first' : ''} ${activeZone === region.id ? 'active-row' : ''}`}>
              <div className="col rank">
                {region.rank === 1 && <Trophy className="icon-primary" size={24} />}
                {region.rank === 2 && <Medal className="icon-secondary" size={24} />}
                {region.rank === 3 && <Medal className="icon-tertiary" size={24} />}
                {region.rank > 3 && <span className="position-number">{region.rank}</span>}
              </div>
              <div className="col region">
                <span className="region-name">{region.name}</span>
                {region.rank === 1 && <span className="badge-champ"><Star size={12}/> {view === 'points' ? 'Champion Spot' : 'Top Recruiter'}</span>}
              </div>
              <div className="col pts">
                <span className="points-value">
                  {view === 'points' ? region.points : region.registrations}
                </span>
                <span className="points-label">
                  {view === 'points' ? 'pts' : 'reg'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .active-row { background: rgba(255, 255, 255, 0.05) !important; }
        .center-align { text-align: center; }
        .leaderboard { display: flex; flex-direction: column; padding: 0; overflow: hidden; }
        .table-header { display: flex; padding: 1.5rem 2rem; background: rgba(15, 15, 14, 0.5); border-bottom: 1px solid rgba(228, 225, 222, 0.1); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem; }
        .table-row { display: flex; padding: 1.5rem 2rem; align-items: center; border-bottom: 1px solid rgba(228, 225, 222, 0.05); transition: all 0.2s; }
        .table-row:hover { background: rgba(228, 225, 222, 0.02); }
        .table-row:last-child { border-bottom: none; }
        .table-row.first { background: rgba(218, 93, 101, 0.05); }
        .col.rank { width: 80px; display: flex; justify-content: center; }
        .col.region { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .col.pts { width: 140px; text-align: right; }
        .position-number { font-size: 1.25rem; font-weight: 700; color: var(--muted); }
        .region-name { font-size: 1.25rem; font-weight: 600; color: var(--text-main); }
        .badge-champ { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase; }
        .points-value { font-size: 1.75rem; font-weight: 800; color: var(--primary); }
        .points-label { font-size: 0.875rem; color: var(--muted); margin-left: 0.25rem; }
        @media (max-width: 600px) { .table-header, .table-row { padding: 1rem; } .col.rank { width: 40px; } .col.pts { width: 100px; } }
      `}</style>
    </div>
  );
}
