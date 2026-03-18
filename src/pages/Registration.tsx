import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CheckCircle2, User, Phone, Calendar, MapPin, Grid, Trophy, Sparkles, Check, Info, Loader2, Camera, Upload, Trash2, FileText } from 'lucide-react';
import { eventsData } from '../data/eventsData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../components/AnimatedSection';

export default function Registration() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    region: '',
    category: '',
    teams: {} as Record<string, { teamName: string, members: { name: string, phone: string }[] }>
  });

  useEffect(() => {
    const eventId = searchParams.get('event');
    window.scrollTo(0, 0);
    if (eventId) {
      const event = eventsData.find(e => e.id === eventId);
      if (event) {
        setFormData(prev => ({ ...prev, category: event.category }));
        setSelectedEvents([event.id]);
      }
    }
  }, [searchParams]);

  const checkDuplicateRegistrations = async () => {
    // 1. Gather all events to check (Individual + Group)
    const selectedEventsData = selectedEvents.map(id => eventsData.find(e => e.id === id)).filter(Boolean);

    // 2. Validate all Captain/Player combinations
    for (const event of selectedEventsData) {
      if (!event) continue;
      const eventSearchStr = `${event.name} (${event.category})`;

      // Players to check for this specific sport
      const playersForThisSport = [];

      // Every sport includes the Captain
      playersForThisSport.push({ name: formData.name, phone: formData.phone, role: 'Captain' });

      // If it's a group sport, add its specific team members
      if (event.type === 'Group' && formData.teams[event.id]) {
        formData.teams[event.id].members.forEach((m, i) => {
          playersForThisSport.push({ ...m, role: `Player ${i + 2}` });
        });
      }

      // Check each player for this sport against DB
      for (const player of playersForThisSport) {
        if (!player.phone || player.phone.length < 10) continue;

        // DB Check 1: Primary registrant
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('full_name, events')
          .eq('phone', player.phone);

        if (regError) {
          console.warn('Duplicate check (primary) skipped due to:', regError.message);
          // If the error is 'PGRST116' (column not found) or '403' (forbidden),
          // we warn but allow the registration to proceed. 
          // This keeps it running if the schema or policies are slightly out of sync.
        }
        
        if (regData) {
          const isDuplicate = regData.some(reg => {
            const events = reg.events;
            if (Array.isArray(events)) {
              return events.includes(eventSearchStr);
            } else if (typeof events === 'string') {
              // Handle potential legacy string/bracket format
              return events.includes(eventSearchStr);
            }
            return false;
          });

          if (isDuplicate) {
            return `${player.role} (${player.name}) is already registered for ${event.name} in another team/entry.`;
          }
        }

        // DB Check 2: Team member in another entry
        // NOTE: This .contains() filter only works on JSONB columns. 
        // If team_members is TEXT or JSON (not JSONB), this will fail with a SQL error.
        let teamData = null;
        let teamError = null;
        try {
          // Use a manual filter string to bypass potential client-side type inference issues
          // that cause it to format as an array {} instead of JSONB [].
          const { data, error } = await supabase
            .from('registrations')
            .select('full_name, events')
            .filter('team_members', 'cs', JSON.stringify([{ phone: player.phone }]));
          teamData = data;
          teamError = error;
        } catch (e) {
          console.error('Unexpected query error during team check:', e);
        }

        if (teamError) {
          // If the error is 'PGRST116' (column not found) or '42P1' (invalid json syntax)
          // or a policy violation (403), we logged it and skip this specific check.
          // This prevents a missing column or strict policy from blocking individual registrations.
          console.warn(`Skipping team member check for ${player.name} due to: ${teamError.message}`);
          
          if (teamError.message.toLowerCase().includes('json')) {
            console.error('HINT: Your "team_members" column should be JSONB. Please run the migration.');
          }
        }

        if (teamData) {
          const isDuplicateInTeam = teamData.some(reg => {
            const events = reg.events;
            if (Array.isArray(events)) {
              return events.includes(eventSearchStr);
            } else if (typeof events === 'string') {
              return events.includes(eventSearchStr);
            }
            return false;
          });

          if (isDuplicateInTeam) {
            return `${player.role} (${player.name}) is already part of a team for ${event.name}.`;
          }
        }
      }

      // 3. Simple cross-check within the current form (prevent same phone twice in one roster section)
      const phones = playersForThisSport.map(p => p.phone).filter(p => p && p.length >= 10);
      const uniquePhones = new Set(phones);
      if (uniquePhones.size !== phones.length) {
        return `Duplicate phone numbers detected in the ${event.name} roster. Please ensure each player has a unique number.`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      alert("Please select at least one event.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Strict Validation Check
      const duplicationError = await checkDuplicateRegistrations();
      if (duplicationError) {
        setError(duplicationError);
        setLoading(false);
        return;
      }

      // 2. Team Member Validation for Group Sports
      for (const eventId of selectedEvents) {
        const event = eventsData.find(e => e.id === eventId);
        if (event?.type === 'Group') {
          const team = formData.teams[eventId];
          if (!team?.teamName?.trim()) {
            throw new Error(`Team name is required for ${event.name}.`);
          }
          
          const filledMembers = team.members.filter(m => m.name.trim() && m.phone.trim());
          const totalPlayers = filledMembers.length + 1; // +1 for Captain

          if (totalPlayers < (event.minPlayers || 1)) {
            throw new Error(`${event.name} requires a minimum of ${event.minPlayers} players. You have currently provided details for ${totalPlayers}.`);
          }

          // Check for valid phone numbers of filled members
          const invalidPhone = filledMembers.find(m => m.phone.length < 10);
          if (invalidPhone) {
            throw new Error(`Please provide a valid 10-digit phone number for ${invalidPhone.name}.`);
          }
        }
      }

      // 3. Prepare Registration Records
      const groupEvents = selectedEvents.map(id => eventsData.find(e => e.id === id)).filter(e => e?.type === 'Group');
      const individualEvents = selectedEvents.map(id => eventsData.find(e => e.id === id)).filter(e => e?.type === 'Individual');

      const parsedAge = parseInt(formData.age);
      if (isNaN(parsedAge)) {
        throw new Error('Please enter a valid age.');
      }

      const registrationRecords = [];

      // Create a separate record for each GROUP sport (different team names/members)
      for (const event of groupEvents) {
        if (!event) continue;
        const teamData = formData.teams[event.id];
        registrationRecords.push({
          user_id: user?.id || null,
          full_name: formData.name,
          phone: formData.phone,
          age: parsedAge,
          region: formData.region,
          category: formData.category,
          team_name: teamData?.teamName || null,
          team_members: teamData?.members || null,
          events: [`${event.name} (${event.category})`]
        });
      }

      // Group INDIVIDUAL sports into their own entry
      if (individualEvents.length > 0) {
        registrationRecords.push({
          user_id: user?.id || null,
          full_name: formData.name,
          phone: formData.phone,
          age: parsedAge,
          region: formData.region,
          category: formData.category,
          team_name: null,
          team_members: [],
          events: individualEvents.map(e => `${e?.name} (${e?.category})`)
        });
      }

      // 3. Batch Submit to Supabase
      const { error: submitError } = await supabase
        .from('registrations')
        .insert(registrationRecords);

      if (submitError) {
        // Provide more detailed feedback for common errors (like missing columns or RLS)
        console.error('Supabase Insertion Error:', submitError);
        throw new Error(`Database Error: ${submitError.message}${submitError.hint ? ` (${submitError.hint})` : ''}`);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('Registration Submission Error:', err);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        // Handle Supabase/Postgrest Error objects
        errorMessage = err.message || err.details || JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (ticketRef.current) {
      try {
        setLoading(true);

        // Create a simplified ghost ticket for reliable capture
        const ghostContainer = document.createElement('div');
        ghostContainer.style.position = 'absolute';
        ghostContainer.style.left = '-9999px';
        ghostContainer.style.top = '0';
        ghostContainer.style.width = '450px';
        ghostContainer.style.background = '#0f0f0e';
        ghostContainer.style.padding = '40px';
        document.body.appendChild(ghostContainer);

        const ticketMarkup = `
          <div style="background: #161614; border: 1px solid #333; border-radius: 16px; overflow: hidden; font-family: sans-serif; color: #e4e1de; width: 100%;">
            <div style="background: #da5d65; color: #ffffff; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; letter-spacing: 0.1em;">
              <span style="font-size: 12px;">PARTICIPANT PASS</span>
              <span style="font-size: 12px; opacity: 0.8;">#${Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
            </div>
            
            <div style="padding: 30px; display: flex; gap: 20px; align-items: flex-start;">
              ${photo ? `<div style="width: 120px; height: 140px; border-radius: 8px; overflow: hidden; border: 1px solid #444; background: #000; flex-shrink: 0;">
                <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>` : ''}
              
              <div style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
                <div>
                  <label style="display: block; font-size: 10px; color: #777; margin-bottom: 4px; font-weight: bold;">NAME</label>
                  <span style="font-size: 18px; font-weight: bold; color: #ffffff;">${formData.name}</span>
                </div>
                <div>
                  <label style="display: block; font-size: 10px; color: #777; margin-bottom: 4px; font-weight: bold;">REGION</label>
                  <span style="font-size: 16px; font-weight: bold; color: #ffffff;">${formData.region.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div style="display: flex; gap: 20px;">
                  <div>
                    <label style="display: block; font-size: 10px; color: #777; margin-bottom: 4px; font-weight: bold;">CATEGORY</label>
                    <span style="font-size: 14px; color: #ffffff;">${formData.category}</span>
                  </div>
                  <div>
                    <label style="display: block; font-size: 10px; color: #777; margin-bottom: 4px; font-weight: bold;">AGE</label>
                    <span style="font-size: 14px; color: #ffffff;">${formData.age} Yrs</span>
                  </div>
                </div>
              </div>
            </div>

            <div style="padding: 20px; border-top: 1px dashed #333; background: #1a1a18;">
              <label style="display: block; font-size: 10px; color: #da5d65; margin-bottom: 10px; font-weight: bold;">REGISTERED EVENTS</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${selectedEvents.map(id => {
          const event = eventsData.find(e => e.id === id);
          return `<span style="background: rgba(228,225,222,0.1); border: 1px solid #333; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: #e4e1de;">${event?.name || id}</span>`;
        }).join('')}
              </div>
            </div>

            <div style="padding: 20px; background: rgba(0,0,0,0.2); display: flex; align-items: center; gap: 15px; border-top: 1px solid #222;">
              <div style="width: 40px; height: 40px; background: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #000;">✓</div>
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #ffffff;">Present this at registration desk</p>
                <p style="margin: 0; font-size: 11px; color: #777;">Avatarana 2026 - Official Participant ID</p>
              </div>
            </div>
          </div>
        `;

        ghostContainer.innerHTML = ticketMarkup;

        // Ensure images in ghost are loaded
        const ghostImages = ghostContainer.querySelectorAll('img');
        await Promise.all(Array.from(ghostImages).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        }));

        const canvas = await html2canvas(ghostContainer, {
          backgroundColor: '#0f0f0e',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`Avatarana_Pass_${formData.name.replace(/\s+/g, '_')}.pdf`);

        document.body.removeChild(ghostContainer);
      } catch (err: unknown) {
        console.error("PDF generation failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to generate PDF. Please try again.";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.error("Camera access denied:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not access camera. Please check permissions.";
      alert(errorMessage);
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => {
      const isAdding = !prev.includes(eventId);
      const next = isAdding ? [...prev, eventId] : prev.filter(id => id !== eventId);

      // Handle dynamic team members for Group events
      const event = eventsData.find(e => e.id === eventId);
      if (event?.type === 'Group') {
        if (isAdding) {
          // Initialize required number of members (minus captain) for this specific sport
          const requiredMembersCount = (event.minPlayers || 1) - 1;
          const newMembers = Array(requiredMembersCount).fill(null).map(() => ({ name: '', phone: '' }));

          setFormData(f => ({
            ...f,
            teams: {
              ...f.teams,
              [eventId]: { teamName: '', members: newMembers }
            }
          }));
        } else {
          // Remove this sport's roster
          setFormData(f => {
            const nextTeams = { ...f.teams };
            delete nextTeams[eventId];
            return { ...f, teams: nextTeams };
          });
        }
      }
      return next;
    });
  };

  const updateTeamName = (eventId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [eventId]: { ...prev.teams[eventId], teamName: name }
      }
    }));
  };

  const updateTeamMember = (eventId: string, memberIndex: number, field: 'name' | 'phone', value: string) => {
    setFormData(prev => {
      const updatedMembers = [...prev.teams[eventId].members];
      updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], [field]: value };
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [eventId]: { ...prev.teams[eventId], members: updatedMembers }
        }
      };
    });
  };

  const addTeamMember = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [eventId]: {
          ...prev.teams[eventId],
          members: [...prev.teams[eventId].members, { name: '', phone: '' }]
        }
      }
    }));
  };

  const removeTeamMember = (eventId: string, memberIndex: number) => {
    setFormData(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [eventId]: {
          ...prev.teams[eventId],
          members: prev.teams[eventId].members.filter((_, i) => i !== memberIndex)
        }
      }
    }));
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
          <div className="decor-blob blob-2" style={{ background: 'var(--tertiary)' }}></div>
        </div>

        <motion.div
          className="success-content"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        >
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

          <div className="ticket-card glass-card" ref={ticketRef}>
            <div className="ticket-header">
              <div className="ticket-type">PARTICIPANT PASS</div>
              <div className="ticket-id">#{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
            </div>

            <div className="ticket-body">
              <div className="ticket-main-info">
                {photo && (
                  <div className="ticket-photo-wrapper">
                    <img src={photo} alt="Participant" className="ticket-photo" />
                  </div>
                )}
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

              {Object.keys(formData.teams).length > 0 && (
                <div className="ticket-teams" style={{ 
                  marginTop: '1.25rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px dashed rgba(228, 225, 222, 0.15)' 
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    fontSize: '0.65rem', 
                    color: 'var(--muted)', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem' 
                  }}>
                    <User size={12} /> TEAM ROSTER
                  </label>
                  <div className="teams-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {Object.entries(formData.teams).map(([eventId, team]) => {
                      const event = eventsData.find(e => e.id === eventId);
                      return (
                        <div key={eventId} className="team-ticket-item">
                          <div style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: 'var(--primary)',
                            marginBottom: '0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}>
                            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{event?.name}:</span> {team.teamName}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            lineHeight: '1.4',
                            color: 'var(--text-main)',
                            opacity: 0.85,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.3rem'
                          }}>
                            <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{formData.name} (C),</span>
                            {team.members.filter(m => m.name).map((m, i, arr) => (
                              <span key={i}>
                                {m.name}{i < arr.length - 1 ? ',' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <button onClick={handleDownload} className="btn-primary">
              <FileText size={18} /> Download PDF Pass
            </button>
            <button onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', age: '', region: '', category: '', teams: {} });
              setSelectedEvents([]);
              setPhoto(null);
            }} className="btn-secondary">
              Register Another
            </button>
          </div>
        </motion.div>

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
            flex: 1;
          }

          .ticket-main-info {
            display: flex;
            gap: 2rem;
            align-items: flex-start;
          }

          .ticket-photo-wrapper {
            width: 150px;
            height: 180px;
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
            flex-shrink: 0;
          }

          .ticket-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
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

      <AnimatedSection className="section-header" direction="up">
        <div className="badge animate-slide-down">REGISTRATION OPEN</div>
        <h1 className="title animate-fade-in"><span className="highlight">Join the</span> Championship</h1>
        <p className="subtitle animate-fade-in-delayed">Fill out the details below to secure your spot in AVATARANA 2026.</p>
        <div className="divider"></div>
      </AnimatedSection>

      <AnimatedSection className="registration-form" direction="up" delay={0.2}>
        <form onSubmit={handleSubmit}>
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
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, region: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
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

              {/* Photo Section */}
              <div className="form-group photo-upload-section">
                <label>Participant Photo</label>
                <div className="photo-controls">
                  {!photo && !isCameraOpen && (
                    <div className="photo-placeholder-grid">
                      <button type="button" onClick={startCamera} className="photo-btn">
                        <Camera size={20} /> Take Photo
                      </button>
                      <button type="button" onClick={() => document.getElementById('file-upload')?.click()} className="photo-btn">
                        <Upload size={20} /> Upload
                      </button>
                      <input
                        type="file"
                        id="file-upload"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}

                  {isCameraOpen && (
                    <div className="camera-view">
                      <video ref={videoRef} autoPlay playsInline className="video-preview" />
                      <div className="camera-actions">
                        <button type="button" onClick={capturePhoto} className="btn-primary">Capture</button>
                        <button type="button" onClick={stopCamera} className="btn-outline">Cancel</button>
                      </div>
                    </div>
                  )}

                  {photo && !isCameraOpen && (
                    <div className="photo-preview-container">
                      <img src={photo} alt="Preview" className="photo-preview" />
                      <button type="button" onClick={() => setPhoto(null)} className="delete-photo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              {/* Dynamic Team Sections */}
              {Object.keys(formData.teams).map(eventId => {
                const event = eventsData.find(e => e.id === eventId);
                if (!event) return null;
                const teamData = formData.teams[eventId];
                const requiredExtra = (event.minPlayers || 1) - 1;

                return (
                  <div key={eventId} className="form-section team-registration-section animate-slide-up">
                    <div className="divider" style={{ margin: '1rem 0', opacity: 0.1, borderTop: '1px solid var(--text-main)' }}></div>
                    <h3 className="section-title">
                      <Trophy size={20} /> Team Registration: {event.name}
                    </h3>
                    <p className="section-desc" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      Minimum {event.minPlayers} players required for this sport.
                    </p>

                    <div className="form-group">
                      <label htmlFor={`teamName-${eventId}`}>Team Name ({event.name})</label>
                      <div className="input-wrapper">
                        <Grid className="input-icon" size={18} />
                        <input
                          type="text"
                          id={`teamName-${eventId}`}
                          required
                          placeholder={`Enter team name for ${event.name}`}
                          value={teamData.teamName}
                          onChange={e => updateTeamName(eventId, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="team-members-list">
                      <div className="members-header">
                        <label>Team Members (Player 1: {formData.name} - Captain)</label>
                        <p className="section-desc">Add at least {requiredExtra} more players.</p>
                      </div>

                      {teamData.members.map((member, idx) => {
                        const isFilled = member.name.trim() && member.phone.trim() && member.phone.length >= 10;
                        return (
                          <div key={idx} className={`member-row animate-fade-in ${isFilled ? 'filled' : ''}`}>
                            <div className="member-number">
                              {isFilled ? <Check size={14} /> : idx + 2}
                            </div>
                            <div className="member-inputs">
                              <input
                                type="text"
                                placeholder="Player Name"
                                value={member.name}
                                onChange={e => updateTeamMember(eventId, idx, 'name', e.target.value)}
                                className="compact-input"
                              />
                              <input
                                type="tel"
                                placeholder="Phone Number"
                                value={member.phone}
                                onChange={e => updateTeamMember(eventId, idx, 'phone', e.target.value)}
                                className="compact-input"
                              />
                            </div>
                            {teamData.members.length > (event.minPlayers || 1) - 1 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(eventId, idx)}
                                className="remove-member-btn"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <button type="button" onClick={() => addTeamMember(eventId)} className="btn-outline add-member-btn">
                        <Sparkles size={16} /> Add Extra Player for {event.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Events Selection */}
            <div className="form-section glass-card animate-slide-up-delayed">
              <h3 className="section-title"><Trophy size={20} /> Interested Events</h3>
              <p className="section-desc">Select all the events you'd like to participate in. {formData.category ? `Showing events for ${formData.category}.` : "Please select a category first."}</p>

              <div className="captain-notice" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.82rem',
                background: 'rgba(92, 158, 156, 0.1)', border: '1px solid rgba(92, 158, 156, 0.2)',
                color: 'var(--secondary)', fontWeight: 600, marginBottom: '0.5rem'
              }}>
                <Info size={16} />
                For team events, only the <strong style={{ color: 'var(--primary)' }}>team captain</strong> should register.
              </div>

              <div className="events-selection-grid">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-card ${selectedEvents.includes(event.id) ? 'selected' : ''}`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="event-card-header">
                      <span className="event-type">{event.type}</span>
                      {event.type === 'Group' && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(218, 93, 101, 0.15)', color: 'var(--primary)',
                          border: '1px solid rgba(218, 93, 101, 0.2)'
                        }}>Captain Only</span>
                      )}
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
      </AnimatedSection>

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
          margin: 0.25rem 0 1rem;
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

        /* Photo Upload Styling */
        .photo-upload-section {
          margin-top: 1rem;
        }

        .photo-controls {
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 15, 14, 0.4);
          border: 1px dashed rgba(228, 225, 222, 0.2);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        .photo-placeholder-grid {
          display: flex;
          gap: 1rem;
          padding: 2rem;
        }

        .photo-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: rgba(228, 225, 222, 0.05);
          border: 1px solid rgba(228, 225, 222, 0.1);
          color: var(--text-main);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .photo-btn:hover {
          background: rgba(228, 225, 222, 0.1);
          border-color: var(--primary);
        }

        .camera-view {
          width: 100%;
          position: relative;
          background: #000;
        }

        .video-preview {
          width: 100%;
          max-height: 300px;
          display: block;
        }

        .camera-actions {
          position: absolute;
          bottom: 1rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .photo-preview-container {
          position: relative;
          width: 100%;
          height: 200px;
          display: flex;
          justify-content: center;
          background: #000;
        }

        .photo-preview {
          height: 100%;
          width: auto;
          max-width: 100%;
          object-fit: contain;
        }

        .delete-photo {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.8);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-photo:hover {
          background: #ef4444;
          transform: scale(1.1);
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

        /* Team Registration Styling */
        .team-registration-section {
          margin-top: 1rem;
        }

        .members-header {
          margin-bottom: 1.5rem;
        }

        .team-members-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .member-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(228, 225, 222, 0.03);
          padding: 1rem;
          border-radius: 16px;
          border: 1px solid rgba(228, 225, 222, 0.08);
          transition: all 0.2s ease;
        }

        .member-row.filled {
          background: rgba(92, 158, 156, 0.08);
          border-color: rgba(92, 158, 156, 0.3);
        }

        .member-row.filled .member-number {
          background: var(--secondary);
          color: white;
          border-color: transparent;
        }

        .member-row:hover {
          background: rgba(228, 225, 222, 0.06);
          border-color: rgba(218, 93, 101, 0.2);
        }

        .member-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-card);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          border: 1px solid rgba(218, 93, 101, 0.2);
          flex-shrink: 0;
        }

        .member-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          flex: 1;
        }

        .compact-input {
          padding: 0.75rem 1rem !important;
          font-size: 0.9rem !important;
          border-radius: 10px !important;
        }

        .remove-member-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .remove-member-btn:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        .add-member-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.875rem !important;
          border-style: dashed !important;
          background: transparent !important;
        }

        .add-member-btn:hover {
          background: rgba(218, 93, 101, 0.05) !important;
          border-style: solid !important;
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
          .ticket-card { border-radius: 12px; }
          .success-actions { flex-direction: column; width: 100%; }
          .success-view { padding: 4rem 1rem; }
          .ticket-main-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
          }
          .ticket-info {
            align-items: center;
            width: 100%;
          }
          .info-row {
            grid-template-columns: 1fr;
            gap: 1rem;
            width: 100%;
          }
          .ticket-header {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
            padding: 1rem;
          }
          .ticket-body {
            padding: 1.5rem;
          }
          .ticket-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
