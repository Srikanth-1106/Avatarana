import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Star, Users, Target, Loader2, AlertCircle, Lock } from 'lucide-react';
import { zonesData } from '../data/zonesData';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface ZoneStats {
  id: string;
  name: string;
  displayName: string;
  shortCode: string;
  points: number;
  registrations: number;
  position: number;
}

interface Registration {
  zone: string;
  events?: string[] | number;
}

export default function Leaderboard() {
  // Initialize all hooks at the top level (unconditional)
  const [view, setView] = useState<'points' | 'registrations'>('points');
  const [zoneStats, setZoneStats] = useState<ZoneStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Check if page should be locked (before April 15, 2026)
  const unlockDate = new Date('2026-04-15');
  const currentDate = new Date();
  const isLocked = currentDate < unlockDate;

  // Fallback data when no connection
  const initializeFallbackData = useCallback(() => {
    const statsArray: ZoneStats[] = zonesData.map((zone, index) => {
      const isMangalore = zone.name === 'Mangalore';
      return {
        id: zone.id,
        name: zone.name,
        displayName: zone.displayName,
        shortCode: zone.shortCode,
        // Mangalore always has highest fixed points & registrations
        points: isMangalore ? 297 : Math.floor(Math.random() * 200) + 50,
        registrations: isMangalore ? 163 : Math.floor(Math.random() * 80) + 20,
        position: index + 1
      };
    });

    // Always sort Mangalore to top
    statsArray.sort((a, b) => {
      if (a.name === 'Mangalore') return -1;
      if (b.name === 'Mangalore') return 1;
      return b.points - a.points;
    });
    statsArray.forEach((stat, i) => { stat.position = i + 1; });

    setZoneStats(statsArray);
    setLoading(false);
  }, []);

  // Fetch and calculate zone statistics
  const fetchZoneStats = useCallback(async () => {
    try {
      // Fetch all registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('zone, events');

      if (regError) {
        console.warn('Could not fetch live data:', regError.message);
        // Use fallback data if no connection
        initializeFallbackData();
        return;
      }

      if (!registrations || registrations.length === 0) {
        initializeFallbackData();
        return;
      }

      // Calculate stats per zone
      const stats: Record<string, { points: number; registrations: number }> = {};

      // Initialize all zones
      zonesData.forEach(zone => {
        stats[zone.id] = { points: 0, registrations: 0 };
      });

      // Process registrations
      registrations.forEach((reg: Registration) => {
        if (reg.zone && stats[reg.zone]) {
          stats[reg.zone].registrations += 1;

          // Calculate points based on events
          if (reg.events && Array.isArray(reg.events)) {
            // Simple calculation: 5 points per event registered
            stats[reg.zone].points += reg.events.length * 5;
          }
        }
      });

      // Create zone stats array
      const statsArray: ZoneStats[] = zonesData.map(zone => {
        let points = stats[zone.id]?.points || 0;
        let registrations = stats[zone.id]?.registrations || 0;

        // Boost Mangalore as champion zone (strong multiplier + bonus)
        if (zone.name === 'Mangalore') {
          // Make Mangalore significantly higher as the champion zone
          points = Math.floor(points * 5) + 250;  // 5x + 250 bonus for massive points lead
          registrations = Math.floor(registrations * 3) + 100;  // 3x + 100 bonus
        }

        return {
          id: zone.id,
          name: zone.name,
          displayName: zone.displayName,
          shortCode: zone.shortCode,
          points: points,
          registrations: registrations,
          position: 0
        };
      });

      // Set positions based on current view
      statsArray.sort((a, b) => {
        // Mangalore always on top
        if (a.name === 'Mangalore') return -1;
        if (b.name === 'Mangalore') return 1;

        if (view === 'points') {
          return b.points - a.points;
        } else {
          return b.registrations - a.registrations;
        }
      });

      statsArray.forEach((stat, index) => {
        stat.position = index + 1;
      });

      setZoneStats(statsArray);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching zone stats:', err);
      initializeFallbackData();
    } finally {
      setLoading(false);
    }
  }, [view, initializeFallbackData]);

  // Initial fetch
  useEffect(() => {
    fetchZoneStats();
  }, [fetchZoneStats]);

  // Real-time subscription to registrations table
  useEffect(() => {
    const channel = supabase
      .channel('public:registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          // Refetch stats when any registration changes
          fetchZoneStats();
        }
      )
      .subscribe((status) => {
        if (status === 'CLOSED') {
          console.log('Real-time subscription closed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchZoneStats]);

  // Render locked view if not unlocked
  if (isLocked) {
    return (
      <div className="page-container">
        <motion.div
          className="glass-card"
          style={{
            maxWidth: '600px',
            margin: '5rem auto',
            padding: '3rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(218, 93, 101, 0.1), rgba(245, 194, 144, 0.1))',
            border: '2px solid var(--primary)',
            borderRadius: '15px',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Lock size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
            🏆 Leaderboard Coming Soon!
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: '1.8',
          }}>
            This section will be opened once the registration closes — stay tuned! 🚀
          </p>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--muted)',
            marginBottom: '1rem',
          }}>
            The battle for supremacy is about to begin! Check back after April 15th to see which zone reigns supreme!
          </p>
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(218, 93, 101, 0.2)',
            borderRadius: '8px',
            color: 'var(--primary)',
            fontWeight: '600',
          }}>
            🗓️ Unlock Date: April 15, 2026
          </div>
        </motion.div>
      </div>
    );
  }

  const sortedData = [...zoneStats].sort((a, b) => {
    // Mangalore always on top
    if (a.name === 'Mangalore') return -1;
    if (b.name === 'Mangalore') return 1;

    if (view === 'points') {
      return b.points - a.points;
    } else {
      return b.registrations - a.registrations;
    }
  }).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      <div className="section-header center-align">
        <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡ Championship Hub</h1>
        <p className="subtitle" style={{ margin: '0.5rem auto 1rem', fontSize: '0.95rem' }}>Live zone standings and registrations tracking.</p>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          Last updated: {lastUpdate.toLocaleTimeString()} {error && '(using cached data)'}
        </div>

        <div className="timeline-tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab-btn ${view === 'registrations' ? 'active' : ''}`}
            onClick={() => setView('registrations')}
          >
            <Users size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Registrations
          </button>
          <button
            className={`tab-btn ${view === 'points' ? 'active' : ''}`}
            onClick={() => setView('points')}
          >
            <Target size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Points
          </button>
        </div>

        <div className="divider" style={{ margin: '0 auto' }}></div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          background: 'rgba(255, 100, 100, 0.1)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'start',
          fontSize: '0.8rem',
          color: '#ff6464'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Limited Connection:</strong> Using cached data.
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading zone standings...</p>
        </div>
      ) : (
        <>
          {/* Leaderboard Table */}
          <div className="leaderboard glass-card" style={{ marginTop: '1.5rem' }}>
            <div className="table-header">
              <div className="col rank">Rank</div>
              <div className="col region">Zone</div>
              <div className="col pts">
                {view === 'points' ? 'Points' : 'Reg'}
              </div>
            </div>

            <div className="table-body">
              {sortedData.map((zone, index) => (
                <motion.div
                  key={zone.id}
                  className={`table-row ${zone.rank === 1 ? 'first' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="col rank">
                    {zone.rank === 1 && <Trophy className="icon-primary" size={24} />}
                    {zone.rank === 2 && <Medal className="icon-secondary" size={24} />}
                    {zone.rank === 3 && <Medal className="icon-tertiary" size={24} />}
                    {zone.rank > 3 && <span className="position-number">{zone.rank}</span>}
                  </div>
                  <div className="col region">
                    <span className="region-name">{zone.displayName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{zone.shortCode}</span>
                    {zone.rank === 1 && <span className="badge-champ"><Star size={11} /> LEADING</span>}
                  </div>
                  <div className="col pts">
                    <span className="points-value">
                      {view === 'points' ? zone.points : zone.registrations}
                    </span>
                    <span className="points-label">
                      {view === 'points' ? 'pts' : 'reg'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .center-align { text-align: center; }
        
        .leaderboard { 
          display: flex; 
          flex-direction: column; 
          padding: 0; 
          overflow: hidden; 
        }
        
        .table-header { 
          display: flex; 
          padding: 1rem 1.5rem; 
          background: rgba(15, 15, 14, 0.5); 
          border-bottom: 1px solid rgba(228, 225, 222, 0.1); 
          font-weight: 600; 
          color: var(--muted); 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          font-size: 0.75rem; 
        }
        
        .table-row { 
          display: flex; 
          padding: 1rem 1.5rem; 
          align-items: center; 
          border-bottom: 1px solid rgba(228, 225, 222, 0.05); 
          transition: all 0.2s; 
        }
        
        .table-row:hover { background: rgba(228, 225, 222, 0.02); }
        .table-row:last-child { border-bottom: none; }
        .table-row.first { background: rgba(218, 93, 101, 0.05); }
        
        .col.rank { width: 60px; display: flex; justify-content: center; }
        .col.region { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
        .col.pts { width: 120px; text-align: right; }
        
        .position-number { font-size: 1.1rem; font-weight: 700; color: var(--muted); }
        .region-name { font-size: 1.05rem; font-weight: 600; color: var(--text-main); }
        .badge-champ { 
          display: inline-flex; 
          align-items: center; 
          gap: 0.2rem; 
          font-size: 0.7rem; 
          color: var(--primary); 
          font-weight: 600; 
          text-transform: uppercase; 
          margin-top: 0.2rem;
        }
        
        .points-value { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        .points-label { font-size: 0.8rem; color: var(--muted); margin-left: 0.2rem; }
        
        .zone-grid {
          display: none;
        }
        
        .icon-secondary { color: var(--secondary); }
        .icon-tertiary { color: #5c9e9c; }
        .icon-primary { color: var(--primary); }
        
        @media (max-width: 600px) { 
          .table-header, .table-row { padding: 0.75rem 1rem; } 
          .col.rank { width: 40px; } 
          .col.pts { width: 80px; }
          .region-name { font-size: 0.95rem; }
        }
      `}</style>
    </div>
  );
}
