import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download, Search, Loader2, AlertCircle, Calendar, Filter, X, Home, Award, Trophy, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { eventsData } from '../data/eventsData';

interface Registration {
  id: string;
  full_name: string;
  phone: string;
  age: number;
  region: string;
  category: string;
  events: string[];
  team_name: string | null;
  team_members: any | null;
  created_at: string;
}

// Professional zone color mapping
const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mangalore': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#2563eb' },
  'Bangalore': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#059669' },
  'Pune': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: '#7c3aed' },
  'Mumbai': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '#d97706' },
  'Delhi': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: '#9333ea' },
  'Kolkata': { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: '#0891b2' },
  'Chennai': { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', border: '#db2777' },
  'Hyderabad': { bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9', border: '#0284c7' },
};

const getZoneColor = (zone: string) => {
  return ZONE_COLORS[zone] || { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280', border: '#4b5563' };
};

export default function AdminDashboard() {
  const { isAdminLoggedIn, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [dateInputFocused, setDateInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'registrations' | 'points'>('registrations');
  const [pointsExpanded, setPointsExpanded] = useState<string | null>(null);
  const [eventResults, setEventResults] = useState<Record<string, Record<number, { zone: string; participant: string }>>>({});
  const [savingPoints, setSavingPoints] = useState(false);
  const [pointsSaved, setPointsSaved] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  // Fetch registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        // Deduplicate registrations based on phone + exact events + team name
        const uniqueRegsMap = new Map();
        if (data) {
          data.forEach((reg: Registration) => {
            const eventStr = Array.isArray(reg.events) ? reg.events.slice().sort().join('|') : String(reg.events || '');
            const key = `${reg.phone}-${eventStr}-${reg.team_name || ''}`;
            if (!uniqueRegsMap.has(key)) {
              uniqueRegsMap.set(key, reg);
            }
          });
        }

        setRegistrations(Array.from(uniqueRegsMap.values()));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
      } finally {
        setLoading(false);
      }
    };

    if (isAdminLoggedIn) {
      fetchRegistrations();
    }
  }, [isAdminLoggedIn]);

  // Fetch existing event results
  useEffect(() => {
    const fetchEventResults = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('event_results')
          .select('*');
        if (!fetchErr && data) {
          const resultsMap: Record<string, Record<number, { zone: string; participant: string }>> = {};
          data.forEach((r: any) => {
            if (!resultsMap[r.event_id]) resultsMap[r.event_id] = {};
            resultsMap[r.event_id][r.position] = { zone: r.zone, participant: r.participant_name || '' };
          });
          setEventResults(resultsMap);
        }
      } catch (_) { /* table may not exist yet */ }
    };
    if (isAdminLoggedIn) fetchEventResults();
  }, [isAdminLoggedIn]);

  // Get unique categories from registrations
  const uniqueCategories = Array.from(new Set(registrations.map(r => r.category))).sort();
  // Get unique events from registrations
  const uniqueEvents = Array.from(new Set(registrations.flatMap(r => Array.isArray(r.events) ? r.events : []))).sort();

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.team_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || reg.region === selectedRegion;
    const matchesCategory = selectedCategory === 'all' || reg.category === selectedCategory;
    const matchesEvent = selectedEvent === 'all' || (Array.isArray(reg.events) && reg.events.includes(selectedEvent));
    
    const regDate = new Date(reg.created_at).toISOString().split('T')[0];
    const matchesDate = !selectedDate || regDate === selectedDate;
    
    return matchesSearch && matchesRegion && matchesCategory && matchesEvent && matchesDate;
  });

  // Export to Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);

      // Prepare data for Excel
      const dataForExcel = filteredRegistrations.map((reg) => {
        let teamMembersFormatted = '--';
        if (reg.team_members) {
           if (Array.isArray(reg.team_members)) {
             teamMembersFormatted = reg.team_members.filter((m: any) => m && m.name).map((m: any) => `${m.name}`).join(', ');
           } else if (typeof reg.team_members === 'object') {
             teamMembersFormatted = Object.values(reg.team_members).join(', ');
           } else {
             teamMembersFormatted = String(reg.team_members);
           }
        }
        
        return {
          'Full Name': reg.full_name,
          'Phone': reg.phone,
          'Age': reg.age,
          'Category': reg.category,
          'Events': Array.isArray(reg.events) ? reg.events.join(', ') : reg.events,
          'Region': reg.region,
          'Team Name': reg.team_name || '--',
          'Team Members': teamMembersFormatted,
        };
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 25 }, // Full Name
        { wch: 15 }, // Phone
        { wch: 8 },  // Age
        { wch: 15 }, // Category
        { wch: 35 }, // Events
        { wch: 15 }, // Region
        { wch: 20 }, // Team Name
        { wch: 40 }, // Team Members
      ];

      // Generate filename with date filter info
      const dateInfo = selectedDate ? `_${selectedDate}` : '';
      const filename = `avatarana_registrations${dateInfo}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  const uniqueRegions = Array.from(new Set(registrations.map(reg => reg.region))).sort();

  return (
    <div className="page-container" style={{ paddingBottom: '2rem', background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(17,24,39,0.8))' }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.08))',
          border: '1.5px solid rgba(59,130,246,0.2)',
          borderRadius: '16px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(59,130,246,0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1.5rem 0' }}>
              Admin Dashboard
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(4px)' }}>
                <p style={{ margin: '0 0 0.75rem 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Total Registrations</p>
                <p style={{ margin: '0', color: '#3b82f6', fontSize: '2.2rem', fontWeight: 'bold' }}>{registrations.length}</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(4px)' }}>
                <p style={{ margin: '0 0 0.75rem 0', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Currently Displaying</p>
                <p style={{ margin: '0', color: '#10b981', fontSize: '2.2rem', fontWeight: 'bold' }}>{filteredRegistrations.length}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                handleLogout();
                navigate('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.75rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.3s',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.75rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.3s',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
              }}
            >
              <Home size={18} />
              Go to Home
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239,68,68,0.3)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'start',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{error}</span>
        </motion.div>
      )}

      {/* Tab Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('registrations')}
          style={{
            flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s',
            background: activeTab === 'registrations' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(30,41,59,0.6)',
            color: activeTab === 'registrations' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'registrations' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
          }}
        >
          📋 Registrations
        </button>
        <button
          onClick={() => setActiveTab('points')}
          style={{
            flex: 1, padding: '1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s',
            background: activeTab === 'points' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30,41,59,0.6)',
            color: activeTab === 'points' ? '#fff' : '#94a3b8',
            boxShadow: activeTab === 'points' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
          }}
        >
          <Trophy size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Point Allocation
        </button>
      </div>

      {activeTab === 'registrations' && (<>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))',
          border: '1px solid rgba(59,130,246,0.1)',
          borderRadius: '14px',
          padding: '2rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
          <Filter size={22} style={{ color: '#3b82f6' }} />
          <h3 style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0' }}>Search & Filter</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  placeholder="Name, phone, team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                    border: '1.5px solid rgba(59,130,246,0.2)',
                    borderRadius: '10px',
                    background: 'rgba(30,41,59,0.5)',
                    color: '#e2e8f0',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'rgba(59,130,246,0.08)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(59,130,246,0.2)';
                    e.target.style.background = 'rgba(30,41,59,0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    padding: '0.875rem 0.75rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1.5px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  }}
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Zone Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zone</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1.5px solid rgba(59,130,246,0.2)',
                borderRadius: '10px',
                background: 'rgba(30,41,59,0.5)',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontWeight: '500',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = 'rgba(59,130,246,0.08)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59,130,246,0.2)';
                e.target.style.background = 'rgba(30,41,59,0.5)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Zones</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid rgba(139,92,246,0.2)', borderRadius: '10px', background: 'rgba(30,41,59,0.5)', color: '#e2e8f0', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '500' }}
              onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = 'rgba(139,92,246,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.2)'; e.target.style.background = 'rgba(30,41,59,0.5)'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '10px', background: 'rgba(30,41,59,0.5)', color: '#e2e8f0', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '500' }}
              onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.background = 'rgba(245,158,11,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(245,158,11,0.2)'; e.target.style.background = 'rgba(30,41,59,0.5)'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="all">All Events</option>
              {uniqueEvents.map((evt) => (
                <option key={evt} value={evt}>{evt}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Date</label>
            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Calendar size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: dateInputFocused ? '#ffffff' : '#10b981',
                  pointerEvents: 'none',
                  transition: 'color 0.3s',
                }} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onFocus={(e) => {
                    setDateInputFocused(true);
                    e.target.style.borderColor = '#10b981';
                    e.target.style.background = 'rgba(16,185,129,0.08)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                  }}
                  onBlur={(e) => {
                    setDateInputFocused(false);
                    e.target.style.borderColor = 'rgba(16,185,129,0.2)';
                    e.target.style.background = 'rgba(30,41,59,0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                    border: '1.5px solid rgba(16,185,129,0.2)',
                    borderRadius: '10px',
                    background: 'rgba(30,41,59,0.5)',
                    color: '#e2e8f0',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  style={{
                    padding: '0.875rem 0.75rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1.5px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  }}
                  title="Clear date filter"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportToExcel}
          disabled={loading || exporting || filteredRegistrations.length === 0}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.125rem 1.5rem',
            background: exporting ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: exporting || loading ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            transition: 'all 0.3s',
            opacity: loading || exporting ? 0.7 : 1,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => {
            if (!loading && !exporting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !exporting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
            }
          }}
        >
          {exporting ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Exporting...
            </>
          ) : (
            <>
              <Download size={20} />
              Export to Excel ({filteredRegistrations.length} records)
            </>
          )}
        </button>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem', color: '#3b82f6' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading registration data...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#94a3b8',
            background: 'rgba(30,41,59,0.4)',
            borderRadius: '14px',
            border: '2px dashed rgba(59,130,246,0.2)',
          }}
        >
          <p style={{ fontSize: '1.2rem', margin: '0', fontWeight: '600' }}>🔍 No registrations found</p>
          <p style={{ fontSize: '0.9rem', margin: '0.75rem 0 0 0', color: '#64748b' }}>Try adjusting your filters to see results</p>
        </motion.div>
      ) : (
        /* Data Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ overflowX: 'auto', borderRadius: '14px' }}
        >
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.6))',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.1)',
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(16,185,129,0.1))',
                borderBottom: '2px solid rgba(59,130,246,0.15)',
              }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Name</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Phone</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Age</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Zone</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Category</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Events</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Team</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, index) => {
                const zoneColor = getZoneColor(reg.region);
                return (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    style={{
                      borderBottom: '1px solid rgba(59,130,246,0.08)',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                      e.currentTarget.style.transform = 'scale(1.008)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#e2e8f0', fontWeight: '600', fontSize: '0.95rem' }}>{reg.full_name}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace' }}>{reg.phone}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.95rem' }}>{reg.age}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 0.875rem',
                        background: zoneColor.bg,
                        color: zoneColor.text,
                        border: `1.5px solid ${zoneColor.border}`,
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                      }}>
                        {reg.region}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <span style={{ background: 'rgba(107,114,128,0.15)', padding: '0.3rem 0.6rem', borderRadius: '6px', display: 'inline-block', border: '1px solid rgba(107,114,128,0.2)' }}>
                        {reg.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      {Array.isArray(reg.events) ? (
                        selectedEvent !== 'all' && reg.events.includes(selectedEvent)
                          ? `${selectedEvent}${reg.events.length > 1 ? ` +${reg.events.length - 1}` : ''}`
                          : `${reg.events[0]}${reg.events.length > 1 ? ` +${reg.events.length - 1}` : ''}`
                      ) : reg.events}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {reg.team_name ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>{reg.team_name}</span>
                          {reg.team_members && (Array.isArray(reg.team_members) ? reg.team_members.length > 0 : Object.keys(reg.team_members).length > 0) && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#cbd5e1' }}>Members:</strong>
                              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {Array.isArray(reg.team_members) 
                                  ? reg.team_members.filter((m: any) => m && m.name).map((m: any, i: number) => (
                                      <li key={i}>{m.name}</li>
                                    ))
                                  : Object.values(reg.team_members).map((name: any, i: number) => (
                                      <li key={i}>{name as string}</li>
                                    ))
                                }
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : <span style={{ color: '#64748b' }}>--</span>}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      {new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      </>)}

      {activeTab === 'points' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '14px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Award size={22} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0' }}>Allocate Points per Event</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Click an event to expand and assign 1st / 2nd / 3rd place zones. Points are auto-calculated from the event rules.
          </p>

          {/* Group by category */}
          {(['Men', 'Women', 'Kids', 'Senior Citizens', 'General'] as const).map(cat => {
            const catEvents = eventsData.filter(e => e.category === cat);
            if (catEvents.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#8b5cf6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid rgba(139,92,246,0.2)', paddingBottom: '0.5rem' }}>
                  {cat} {cat === 'Kids' ? '' : 'Events'}
                </h4>
                {catEvents.map(evt => {
                  const isExpanded = pointsExpanded === evt.id;
                  const results = eventResults[evt.id] || {};
                  const positions = evt.type === 'Individual' ? [1, 2, 3] : [1, 2];
                  const posColors: Record<number, string> = { 1: '#fbbf24', 2: '#94a3b8', 3: '#cd7f32' };
                  const posLabels: Record<number, string> = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place' };

                  return (
                    <div key={evt.id} style={{ marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => setPointsExpanded(isExpanded ? null : evt.id)}
                        style={{
                          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.875rem 1rem', background: isExpanded ? 'rgba(245,158,11,0.1)' : 'rgba(30,41,59,0.5)',
                          border: `1px solid ${isExpanded ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.1)'}`,
                          borderRadius: isExpanded ? '10px 10px 0 0' : '10px', color: '#e2e8f0', cursor: 'pointer',
                          fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
                        }}
                      >
                        <span>{evt.name} {evt.subCategory ? `(${evt.subCategory})` : ''} <span style={{ color: '#64748b', fontWeight: '400', fontSize: '0.8rem' }}>— {evt.type}</span></span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {Object.keys(results).length > 0 && <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>ASSIGNED</span>}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(245,158,11,0.15)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '1rem' }}
                          >
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                              {(() => {
                                // Get registrations for this specific event
                                const eventRegs = registrations.filter(r =>
                                  Array.isArray(r.events) && 
                                  (r.events.includes(evt.name) || r.events.includes(`${evt.name} (${evt.category})`)) &&
                                  r.category === evt.category
                                );
                                // Build options: for Group events use team_name, for Individual use full_name
                                const options = evt.type === 'Group'
                                  ? Array.from(new Map(eventRegs.filter(r => r.team_name).map(r => [r.team_name, r])).values())
                                      .map(r => ({ label: `${r.region} - ${r.team_name}`, value: r.team_name!, zone: r.region }))
                                  : eventRegs.map(r => ({ label: `${r.region} - ${r.full_name}`, value: r.full_name, zone: r.region }));

                                // Sort the options by zone name alphabetically
                                options.sort((a, b) => (a.zone || '').localeCompare(b.zone || ''));

                                return positions.map(pos => {
                                  const pts = pos === 1 ? evt.points.first : pos === 2 ? evt.points.second : (evt.points.third || 0);
                                  const selectedValue = results[pos]?.participant || '';
                                  return (
                                    <div key={pos} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                                      <div style={{ color: posColors[pos], fontWeight: '700', fontSize: '0.85rem' }}>
                                        {posLabels[pos]} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({pts} pts)</span>
                                      </div>
                                      <select
                                        value={selectedValue}
                                        onChange={(e) => {
                                          const picked = options.find(o => o.value === e.target.value);
                                          setEventResults(prev => ({
                                            ...prev,
                                            [evt.id]: { ...prev[evt.id], [pos]: { zone: picked?.zone || '', participant: e.target.value } }
                                          }));
                                        }}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(30,41,59,0.8)', color: '#e2e8f0', fontSize: '0.85rem' }}
                                      >
                                        <option value="">{evt.type === 'Group' ? 'Select Team' : 'Select Participant'}</option>
                                        {options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
                                      </select>
                                      {results[pos]?.zone && (
                                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                          {results[pos].zone}
                                        </span>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={async () => {
                                  // Delete existing results for this event
                                  await supabase.from('event_results').delete().eq('event_id', evt.id);
                                  setEventResults(prev => { const n = { ...prev }; delete n[evt.id]; return n; });
                                  setPointsSaved(evt.id + '_cleared');
                                  setTimeout(() => setPointsSaved(null), 2000);
                                }}
                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Trash2 size={14} /> Clear
                              </button>
                              <button
                                disabled={savingPoints}
                                onClick={async () => {
                                  setSavingPoints(true);
                                  try {
                                    await supabase.from('event_results').delete().eq('event_id', evt.id);
                                    const rows = positions
                                      .filter(p => results[p]?.zone)
                                      .map(p => ({
                                        event_id: evt.id, event_name: evt.name, category: evt.category, event_type: evt.type,
                                        zone: results[p]!.zone, position: p,
                                        points: p === 1 ? evt.points.first : p === 2 ? evt.points.second : (evt.points.third || 0),
                                        participant_name: results[p]?.participant || null,
                                      }));
                                    if (rows.length > 0) await supabase.from('event_results').insert(rows);
                                    setPointsSaved(evt.id);
                                    setTimeout(() => setPointsSaved(null), 2000);
                                  } catch (e) { setError('Failed to save points'); }
                                  setSavingPoints(false);
                                }}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: savingPoints ? 0.6 : 1 }}
                              >
                                <Save size={14} /> {pointsSaved === evt.id ? '✓ Saved!' : 'Save'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </motion.div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        select option {
          background-color: #ffffff;
          color: #1e293b;
          padding: 0.75rem;
          font-weight: 500;
          border: none;
        }

        select option:hover {
          background-color: #dbeafe;
          color: #1e293b;
        }

        select option:checked {
          background: linear-gradient(#3b82f6, #3b82f6);
          background-color: #3b82f6;
          color: #ffffff;
        }

        select {
          option:first-child {
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
}
