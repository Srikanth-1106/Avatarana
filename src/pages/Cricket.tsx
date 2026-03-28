import { useState, useEffect, useCallback } from 'react';
import { Trophy, TrendingUp, Users, Flame, Target, Loader2, AlertCircle, Lock } from 'lucide-react';
import { zonesData } from '../data/zonesData';
import { AnimatedSection } from '../components/AnimatedSection';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export interface CricketTeam {
  name: string;
  zone: string;
  players: number;
  wins: number;
  losses: number;
  points: number;
  nrr?: number;
}

export default function CricketPointsTable() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'wins' | 'nrr'>('points');
  const [teams, setTeams] = useState<CricketTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if page should be locked (before April 15, 2026)
  const unlockDate = new Date('2026-04-15');
  const currentDate = new Date();
  const isLocked = currentDate < unlockDate;

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
            🏏 Championship Coming Soon!
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
            The epic cricket championship awaits! Check back after April 15th to see live standings and team performances.
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

  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cricket_teams')
        .select('*');
      
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet (migration not run)
          setError('Cricket Leaderboard is being configured! Admins need to run the final setup logic.');
        } else {
          setError(error.message);
        }
        setTeams([]);
        return;
      }
      
      if (data) {
        setTeams(data);
      }
      setError(null);
    } catch (err: any) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);


  // Filter teams based on selected zone
  const filteredTeams = selectedZone
    ? teams.filter((team: CricketTeam) => 
        zonesData.find(z => z.name === team.zone && z.id === selectedZone)
      )
    : teams;

  // Sort teams with standard cricket tie-breakers
  const sortedTeams = [...filteredTeams].sort((a: CricketTeam, b: CricketTeam) => {
    if (sortBy === 'points') {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.nrr || 0) - (a.nrr || 0);
    } else if (sortBy === 'wins') {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.points !== a.points) return b.points - a.points;
      return (b.nrr || 0) - (a.nrr || 0);
    } else {
      if ((b.nrr || 0) !== (a.nrr || 0)) return (b.nrr || 0) - (a.nrr || 0);
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    }
  });

  // Calculate zone-wise points
  const zonePoints = zonesData.map(zone => {
    const zoneTeams = teams.filter((team: CricketTeam) => team.zone === zone.name);
    const totalPoints = zoneTeams.reduce((sum: number, team: CricketTeam) => sum + team.points, 0);
    const totalWins = zoneTeams.reduce((sum: number, team: CricketTeam) => sum + team.wins, 0);
    return { zone, totalPoints, totalWins, teamCount: zoneTeams.length };
  }).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.totalWins - a.totalWins;
  });

  return (
    <div className="page-container">
      <AnimatedSection>
        <div className="section-header center-align">
          <h1 className="title" style={{ fontSize: '3rem' }}>🏏 Cricket Championship</h1>
          <p className="subtitle" style={{ margin: '1rem auto 2rem' }}>
            Zone-wise Points Table & Live Standings
          </p>
          <div className="divider" style={{ margin: '0 auto' }}></div>
        </div>
      </AnimatedSection>

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
            <strong>Status:</strong> {error}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading live cricket standings...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Zone Overview Cards */}
          <AnimatedSection delay={0.1}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Flame size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Zone Performance
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {zonePoints.map((item, index) => (
              <motion.div
                key={item.zone.id}
                className="glass-card"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedZone(selectedZone === item.zone.id ? null : item.zone.id)}
                style={{
                  cursor: 'pointer',
                  padding: '1.5rem',
                  border:
                    selectedZone === item.zone.id
                      ? '2px solid var(--primary)'
                      : '1px solid rgba(228, 225, 222, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      {item.zone.displayName}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                      {item.teamCount} {item.teamCount === 1 ? 'team' : 'teams'}
                    </p>
                  </div>
                  {index === 0 && <Trophy size={24} style={{ color: 'var(--primary)' }} />}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Points
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {item.totalPoints}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Wins
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                      {item.totalWins}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Sort Options */}
      <AnimatedSection delay={0.2}>
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSortBy('points')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: sortBy === 'points' ? 'var(--primary)' : 'rgba(228, 225, 222, 0.1)',
              color: sortBy === 'points' ? '#000' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            <TrendingUp size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            By Points
          </button>
          <button
            onClick={() => setSortBy('wins')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: sortBy === 'wins' ? 'var(--primary)' : 'rgba(228, 225, 222, 0.1)',
              color: sortBy === 'wins' ? '#000' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            <Trophy size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            By Wins
          </button>
          <button
            onClick={() => setSortBy('nrr')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: sortBy === 'nrr' ? 'var(--primary)' : 'rgba(228, 225, 222, 0.1)',
              color: sortBy === 'nrr' ? '#000' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            <Target size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            By NRR
          </button>
          {selectedZone && (
            <button
              onClick={() => setSelectedZone(null)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 100, 100, 0.5)',
                background: 'rgba(255, 100, 100, 0.1)',
                color: '#ff6464',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
            >
              Clear Zone Filter
            </button>
          )}
        </div>
      </AnimatedSection>

      {/* Cricket Points Table */}
      <AnimatedSection delay={0.3}>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(228, 225, 222, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              <Users size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              {selectedZone
                ? zonesData.find(z => z.id === selectedZone)?.displayName + ' Teams'
                : 'All Teams'}{' '}
              ({sortedTeams.length})
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid rgba(228, 225, 222, 0.2)',
                    background: 'rgba(228, 225, 222, 0.05)'
                  }}
                >
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Rank
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Team Name
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Zone
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Matches
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Wins
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Points
                  </th>
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    NRR
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, index) => (
                  <motion.tr
                    key={team.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      borderBottom: '1px solid rgba(228, 225, 222, 0.1)',
                      background:
                        index === 0
                          ? 'rgba(200, 120, 40, 0.05)'
                          : index === 1
                            ? 'rgba(180, 180, 180, 0.05)'
                            : 'transparent',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        index === 0
                          ? 'rgba(200, 120, 40, 0.1)'
                          : index === 1
                            ? 'rgba(180, 180, 180, 0.1)'
                            : 'rgba(228, 225, 222, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index === 0
                          ? 'rgba(200, 120, 40, 0.05)'
                          : index === 1
                            ? 'rgba(180, 180, 180, 0.05)'
                            : 'transparent';
                    }}
                  >
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                              ? '#C0C0C0'
                              : index === 2
                                ? '#CD7F32'
                                : 'var(--text)'
                      }}
                    >
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        fontWeight: 600,
                        color: 'var(--text)'
                      }}
                    >
                      {team.name}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--muted)'
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(100, 150, 200, 0.2)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      >
                        {zonesData.find(z => z.name === team.zone)?.shortCode}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        color: 'var(--text)',
                        fontWeight: 600
                      }}
                    >
                      {team.wins + team.losses}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '1.125rem'
                      }}
                    >
                      {team.wins}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '1.25rem'
                      }}
                    >
                      {team.points}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        color: team.nrr && team.nrr > 0 ? '#4ade80' : '#ff6464',
                        fontWeight: 600
                      }}
                    >
                      {team.nrr && team.nrr.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>

      {/* Cricket Rules */}
      <AnimatedSection delay={0.4}>
        <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            🏏 Cricket Championship Rules
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}
          >
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Zone Eligibility:</strong> Only teams from the 8 specified zones can participate in cricket
                events.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Team Composition:</strong> Each team must have exactly 11 players from their respective zone.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Points System:</strong> Win = 4 points, Tie/No Result = 2 points, Loss = 0 points.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Tie-Breaking:</strong> Points sorted by wins, then by Net Run Rate (NRR).
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Zone Standing:</strong> Total zone points calculated from all team performances.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', minWidth: '24px' }}>✓</span>
              <span>
                <strong>Championship Winner:</strong> Zone with highest aggregate points wins the cricket championship.
              </span>
            </li>
          </ul>
        </div>
      </AnimatedSection>
      </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .center-align {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
