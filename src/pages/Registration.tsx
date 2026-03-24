import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { CheckCircle2, User, Phone, Calendar, Grid, Trophy, Sparkles, Check, Info, Loader2, Camera, Upload, Trash2, FileText, Globe, Download, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { eventsData } from '../data/eventsData';
import { zonesData } from '../data/zonesData';
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
  const [downloadPhase, setDownloadPhase] = useState<'idle' | 'preparing' | 'downloading' | 'done'>('idle');
  const autoDownloadTriggered = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    zone: '',
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



    // 3. Validate all Captain/Player combinations
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

        // DB Check 1: Check for DIFFERENT ZONE (Consistency)
        // Check both as primary and as member
        const { data: globalZoneCheck } = await supabase
          .from('registrations')
          .select('region, full_name')
          .or(`phone.eq.${player.phone},team_members.cs.[{"phone":"${player.phone}"}]`);

        if (globalZoneCheck && globalZoneCheck.length > 0) {
          const firstExisting = globalZoneCheck[0];
          if (firstExisting.region && firstExisting.region !== formData.zone) {
            const existingZoneName = zonesData.find(z => z.id === firstExisting.region)?.displayName || firstExisting.region;
            const currentZoneName = zonesData.find(z => z.id === formData.zone)?.displayName || formData.zone;
            return `${player.role} (${player.name}) is already associated with zone "${existingZoneName}". They cannot register under a different zone ("${currentZoneName}"). A player can only represent one zone across all events.`;
          }
        }

        // DB Check 2: Same Event check
        const { data: sameEventCheck } = await supabase
          .from('registrations')
          .select('full_name, events, team_name')
          .or(`phone.eq.${player.phone},team_members.cs.[{"phone":"${player.phone}"}]`);

        if (sameEventCheck) {
          for (const reg of sameEventCheck) {
            const eventsArr = reg.events;
            let isMatchedEvent = false;
            if (Array.isArray(eventsArr)) {
              isMatchedEvent = eventsArr.includes(eventSearchStr);
            } else if (typeof eventsArr === 'string') {
              isMatchedEvent = eventsArr.includes(eventSearchStr);
            }

            if (isMatchedEvent) {
              if (event.type === 'Group' && reg.team_name) {
                return `${player.role} (${player.name}) is already registered for ${event.name} in team "${reg.team_name}". A player cannot be on multiple teams for the same sport.`;
              }
              return `${player.role} (${player.name}) is already registered for ${event.name}.`;
            }
          }
        }


      }

      // 4. Simple cross-check within the current form (prevent same phone twice in one roster section)
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

    // Check if cricket is selected and zone is required
    const hasCricket = selectedEvents.some(id => {
      const event = eventsData.find(e => e.id === id);
      return event?.name === 'Cricket';
    });

    if (hasCricket && !formData.zone) {
      setError('Zone selection is required to participate in Cricket. Please select your zone.');
      return;
    }

    // Validate zone for cricket participation
    if (hasCricket) {
      const validZones = zonesData.map(z => z.id);
      if (!validZones.includes(formData.zone)) {
        setError('Invalid zone selected. Please select from the available zones for cricket.');
        return;
      }
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
          region: formData.zone || null,
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
          region: formData.zone || null,
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    try {
      setLoading(true);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 160]
      });

      const pageWidth = 100;
      const passId = `#${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const zoneName = zonesData.find(z => z.id === formData.zone)?.displayName || formData.zone || 'N/A';

      // ─── Header Bar ───
      pdf.setFillColor(218, 93, 101); // --primary
      pdf.rect(0, 0, pageWidth, 14, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text('PARTICIPANT PASS', 6, 9);
      pdf.setFontSize(6);
      pdf.setTextColor(255, 255, 255);
      pdf.text(passId, pageWidth - 6, 9, { align: 'right' });

      // ─── Body Background ───
      pdf.setFillColor(22, 22, 20);
      pdf.rect(0, 14, pageWidth, 146, 'F');

      let yPos = 24;

      // ─── Photo ───
      if (photo) {
        try {
          pdf.addImage(photo, 'JPEG', 6, yPos, 22, 28);
          // Draw border around photo
          pdf.setDrawColor(80, 80, 80);
          pdf.setLineWidth(0.3);
          pdf.rect(6, yPos, 22, 28);
        } catch (imgErr) {
          console.warn('Photo could not be added to PDF:', imgErr);
        }
      }

      const textStartX = photo ? 34 : 6;

      // ─── Name ───
      pdf.setFontSize(5);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'bold');
      pdf.text('NAME', textStartX, yPos + 3);
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text(formData.name, textStartX, yPos + 9, { maxWidth: pageWidth - textStartX - 6 });

      // ─── Zone ───
      pdf.setFontSize(5);
      pdf.setTextColor(120, 120, 120);
      pdf.text('ZONE', textStartX, yPos + 16);
      pdf.setFontSize(9);
      pdf.setTextColor(92, 158, 156); // --secondary
      pdf.setFont('helvetica', 'bold');
      pdf.text(zoneName, textStartX, yPos + 21);

      // ─── Category & Age ───
      pdf.setFontSize(5);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CATEGORY', textStartX, yPos + 27);
      pdf.setFontSize(8);
      pdf.setTextColor(228, 225, 222);
      pdf.text(formData.category || 'N/A', textStartX, yPos + 32);

      pdf.setFontSize(5);
      pdf.setTextColor(120, 120, 120);
      pdf.text('AGE', textStartX + 30, yPos + 27);
      pdf.setFontSize(8);
      pdf.setTextColor(228, 225, 222);
      pdf.text(`${formData.age} Yrs`, textStartX + 30, yPos + 32);

      yPos += (photo ? 36 : 36);

      // ─── Dashed Divider ───
      pdf.setDrawColor(60, 60, 60);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.setLineWidth(0.2);
      pdf.line(6, yPos, pageWidth - 6, yPos);
      pdf.setLineDashPattern([], 0);
      yPos += 6;

      // ─── Registered Events ───
      pdf.setFontSize(5);
      pdf.setTextColor(218, 93, 101);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REGISTERED EVENTS', 6, yPos);
      yPos += 5;

      pdf.setFontSize(7);
      pdf.setTextColor(228, 225, 222);
      pdf.setFont('helvetica', 'normal');
      selectedEvents.forEach(id => {
        const event = eventsData.find(e => e.id === id);
        const eventName = event?.name || id;
        // Draw pill background
        const textWidth = pdf.getTextWidth(eventName) + 4;
        pdf.setFillColor(40, 40, 38);
        pdf.roundedRect(6, yPos - 3, textWidth, 5, 1.5, 1.5, 'F');
        pdf.text(eventName, 8, yPos);
        yPos += 7;
      });

      // ─── Team Info (if any) ───
      if (Object.keys(formData.teams).length > 0) {
        yPos += 2;
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineDashPattern([1, 1], 0);
        pdf.line(6, yPos, pageWidth - 6, yPos);
        pdf.setLineDashPattern([], 0);
        yPos += 5;

        pdf.setFontSize(5);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TEAM ROSTER', 6, yPos);
        yPos += 5;

        Object.entries(formData.teams).forEach(([eventId, team]) => {
          const event = eventsData.find(e => e.id === eventId);
          pdf.setFontSize(6);
          pdf.setTextColor(218, 93, 101);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${event?.name}: ${team.teamName}`, 6, yPos);
          yPos += 4;

          pdf.setFontSize(6);
          pdf.setTextColor(200, 200, 200);
          pdf.setFont('helvetica', 'normal');
          const memberNames = [`${formData.name} (C)`, ...team.members.filter(m => m.name).map(m => m.name)].join(', ');
          const lines = pdf.splitTextToSize(memberNames, pageWidth - 12);
          pdf.text(lines, 6, yPos);
          yPos += lines.length * 4 + 2;
        });
      }

      // ─── Footer ───
      const footerY = 145;
      pdf.setFillColor(15, 15, 14);
      pdf.rect(0, footerY, pageWidth, 15, 'F');
      pdf.setDrawColor(40, 40, 38);
      pdf.line(0, footerY, pageWidth, footerY);

      // Checkmark circle
      pdf.setFillColor(255, 255, 255);
      pdf.circle(14, footerY + 7.5, 4, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text('✓', 12.5, footerY + 9.5);

      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Present this at registration desk', 22, footerY + 6);
      pdf.setFontSize(5.5);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Avatarana 2026 - Official Participant ID', 22, footerY + 10.5);

      // Create a very safe filename (no special chars that might break extension detection)
      const safeName = formData.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') || 'Guest';
      const fileName = `Avatarana_Pass_${safeName}.pdf`;

      // Use a pure Base64 Data URI. This format is synchronous, doesn't expire, and prevents 
      // the browser download manager from throwing 'Network Error' or 'Check Internet Connection'
      // which happens when Blob URLs are revoked too quickly by cleanup scripts.
      const pdfDataUri = pdf.output('datauristring');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfDataUri;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup DOM (no need to revoke URL since it's a data URI)
      document.body.removeChild(downloadLink);
    } catch (err: unknown) {
      console.error('PDF generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
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
          onAnimationComplete={() => {
            // Auto-download the pass after the success animation completes
            if (!autoDownloadTriggered.current) {
              autoDownloadTriggered.current = true;
              setTimeout(() => {
                setDownloadPhase('preparing');
                setTimeout(() => {
                  setDownloadPhase('downloading');
                  // Trigger actual download
                  handleDownload().then(() => {
                    setDownloadPhase('done');
                    // Fire celebration confetti
                    confetti({
                      particleCount: 80,
                      spread: 70,
                      origin: { y: 0.7 },
                      colors: ['#da5d65', '#5c9e9c', '#FFD700', '#e4e1de'],
                      zIndex: 10000,
                    });
                  });
                }, 1500);
              }, 1200);
            }
          }}
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
                    <label>ZONE</label>
                    <span>{zonesData.find(z => z.id === formData.zone)?.displayName}</span>
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

          {/* Auto-Download Progress Animation */}
          <div className="auto-download-section">
            <div className={`download-progress-card glass-card ${downloadPhase}`}>
              <div className="download-progress-track">
                <div className={`download-progress-fill ${downloadPhase}`} />
              </div>
              <div className="download-status-row">
                {downloadPhase === 'idle' && (
                  <>
                    <div className="download-icon-wrapper waiting">
                      <Loader2 size={22} className="spin-icon" />
                    </div>
                    <span>Preparing your pass...</span>
                  </>
                )}
                {downloadPhase === 'preparing' && (
                  <>
                    <div className="download-icon-wrapper preparing">
                      <FileText size={22} />
                    </div>
                    <span>Generating PDF pass...</span>
                  </>
                )}
                {downloadPhase === 'downloading' && (
                  <>
                    <div className="download-icon-wrapper downloading">
                      <ArrowDown size={22} className="bounce-icon" />
                    </div>
                    <span>Downloading your pass...</span>
                  </>
                )}
                {downloadPhase === 'done' && (
                  <>
                    <div className="download-icon-wrapper done">
                      <CheckCircle2 size={22} />
                    </div>
                    <span>Pass downloaded successfully!</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={() => { setDownloadPhase('downloading'); handleDownload().then(() => { setDownloadPhase('done'); }); }} className="btn-primary">
              <Download size={18} /> Download Again
            </button>
            <button onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', age: '', zone: '', category: '', teams: {} });
              setSelectedEvents([]);
              setPhoto(null);
              setDownloadPhase('idle');
              autoDownloadTriggered.current = false;
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
            min-width: 0;
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
            word-break: break-word;
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

          /* Auto-Download Animation */
          .auto-download-section {
            width: 100%;
            animation: fadeIn 0.6s ease-out 0.5s both;
          }

          .download-progress-card {
            padding: 1.25rem 1.5rem;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            background: rgba(22, 22, 20, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .download-progress-card.done {
            border-color: rgba(92, 158, 156, 0.4);
            box-shadow: 0 0 30px rgba(92, 158, 156, 0.1);
          }

          .download-progress-track {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(255, 255, 255, 0.05);
          }

          .download-progress-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s;
            width: 0%;
          }

          .download-progress-fill.idle {
            width: 10%;
            background: linear-gradient(90deg, var(--primary), var(--primary));
            animation: progress-pulse 1.5s ease-in-out infinite;
          }

          .download-progress-fill.preparing {
            width: 45%;
            background: linear-gradient(90deg, var(--primary), #FFD700);
          }

          .download-progress-fill.downloading {
            width: 80%;
            background: linear-gradient(90deg, #FFD700, var(--secondary));
          }

          .download-progress-fill.done {
            width: 100%;
            background: linear-gradient(90deg, var(--secondary), #25D366);
          }

          .download-status-row {
            display: flex;
            align-items: center;
            gap: 0.85rem;
          }

          .download-status-row span {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-main);
          }

          .download-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.4s ease;
          }

          .download-icon-wrapper.waiting {
            background: rgba(218, 93, 101, 0.15);
            color: var(--primary);
          }

          .download-icon-wrapper.preparing {
            background: rgba(255, 215, 0, 0.15);
            color: #FFD700;
            animation: icon-scale-in 0.4s ease-out;
          }

          .download-icon-wrapper.downloading {
            background: rgba(92, 158, 156, 0.15);
            color: var(--secondary);
            animation: icon-scale-in 0.4s ease-out;
          }

          .download-icon-wrapper.done {
            background: rgba(37, 211, 102, 0.15);
            color: #25D366;
            animation: icon-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .spin-icon {
            animation: spin 1s linear infinite;
          }

          .bounce-icon {
            animation: bounce-down 0.8s ease-in-out infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes bounce-down {
            0%, 100% { transform: translateY(-3px); }
            50% { transform: translateY(3px); }
          }

          @keyframes icon-scale-in {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          @keyframes icon-pop {
            0% { transform: scale(0.5); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }

          @keyframes progress-pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          /* Existing Animations */
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
                    name="name"
                    autoComplete="name"
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
                      name="phone"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: digits });
                      }}
                    />
                  </div>
                  {formData.phone.length > 0 && formData.phone.length < 10 && (
                    <span className="field-hint" style={{ fontSize: '0.7rem', color: 'var(--primary)', opacity: 0.8, marginTop: '0.25rem', display: 'block' }}>
                      {10 - formData.phone.length} more digit{10 - formData.phone.length !== 1 ? 's' : ''} needed
                    </span>
                  )}
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
                  <label htmlFor="zone">Zone</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon" size={18} />
                    <select
                      id="zone"
                      required
                      value={formData.zone}
                      onChange={e => setFormData({ ...formData, zone: e.target.value })}
                    >
                      <option value="">Select your zone...</option>
                      {zonesData.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.displayName}
                        </option>
                      ))}
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
                        style={{ display: 'none' }}
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
                      <button type="button" onClick={() => setPhoto(null)} className="delete-photo" aria-label="Delete Photo">
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
                                placeholder="10-digit number"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                value={member.phone}
                                onChange={e => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  updateTeamMember(eventId, idx, 'phone', digits);
                                }}
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
              <h3 className="section-title"><Trophy size={24} /> Interested Events</h3>
              <p className="section-desc">Select all the events you'd like to participate in. {formData.category ? `Showing events for ${formData.category}.` : "Please select a category first."}</p>

              <div className="captain-notice" style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem',
                background: 'linear-gradient(135deg, rgba(92, 158, 156, 0.12) 0%, rgba(92, 158, 156, 0.06) 100%)',
                border: '1.5px solid rgba(92, 158, 156, 0.3)', color: 'var(--secondary)', fontWeight: 600,
                marginBottom: '1.5rem'
              }}>
                <Info size={18} style={{ flexShrink: 0, opacity: 0.8 }} />
                <span>For team events, only the <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>team captain</strong> should register.</span>
              </div>

              <div className="events-selection-grid">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-card ${selectedEvents.includes(event.id) ? 'selected' : ''}`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="event-card-header">
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="event-type">{event.type}</span>
                        {event.type === 'Group' && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px',
                            background: 'rgba(218, 93, 101, 0.15)', color: 'var(--primary)',
                            border: '1px solid rgba(218, 93, 101, 0.2)',
                            whiteSpace: 'nowrap'
                          }}>Captain Only</span>
                        )}
                      </div>
                      {selectedEvents.includes(event.id) && <Check size={14} className="check-icon" style={{ flexShrink: 0 }} />}
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
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        label {
          font-weight: 700;
          color: var(--text-main);
          font-size: 0.95rem;
          opacity: 1;
          letter-spacing: 0.02em;
          display: block;
          margin-bottom: 0.25rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1.2rem;
          color: var(--muted);
          pointer-events: none;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        input, select {
          width: 100%;
          padding: 1rem 2.5rem 1rem 3rem;
          border-radius: 12px;
          border: 1.5px solid rgba(228, 225, 222, 0.12);
          background: rgba(15, 15, 14, 0.4);
          color: var(--text-main);
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
          box-sizing: border-box;
          text-overflow: ellipsis;
          min-width: 0;
        }

        select {
          padding-right: 3rem;
          appearance: auto;
          font-size: 0.88rem;
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
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.2rem;
          max-height: 450px;
          overflow-y: auto;
          padding-right: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(218, 93, 101, 0.5) transparent;
        }

        .events-selection-grid::-webkit-scrollbar {
          width: 6px;
        }

        .events-selection-grid::-webkit-scrollbar-track {
          background: rgba(228, 225, 222, 0.05);
          border-radius: 10px;
        }

        .events-selection-grid::-webkit-scrollbar-thumb {
          background-color: rgba(218, 93, 101, 0.4);
          border-radius: 10px;
          transition: background-color 0.2s;
        }

        .events-selection-grid::-webkit-scrollbar-thumb:hover {
          background-color: var(--primary);
        }

        .event-card {
          background: rgba(228, 225, 222, 0.03);
          border: 1.5px solid rgba(228, 225, 222, 0.12);
          border-radius: 14px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          position: relative;
          user-select: none;
          background-clip: padding-box;
        }

        .event-card:hover {
          background: rgba(228, 225, 222, 0.1);
          border-color: rgba(218, 93, 101, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(218, 93, 101, 0.1);
        }

        .event-card.selected {
          background: linear-gradient(135deg, rgba(218, 93, 101, 0.2) 0%, rgba(218, 93, 101, 0.1) 100%);
          border-color: var(--primary);
          box-shadow: 0 6px 20px rgba(218, 93, 101, 0.25);
          transform: translateY(-2px) scale(1.02);
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .event-type {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--secondary);
          font-weight: 700;
          background: rgba(92, 158, 156, 0.15);
          padding: 0.35rem 0.6rem;
          border-radius: 5px;
        }

        .check-icon {
          color: var(--primary);
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .event-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-main);
        }

        .event-subcategory {
          font-size: 0.75rem;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .no-events {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 2rem;
          color: var(--muted);
          text-align: center;
          gap: 1rem;
          background: rgba(228, 225, 222, 0.03);
          border-radius: 12px;
          border: 1.5px dashed rgba(228, 225, 222, 0.15);
        }

        .no-events svg {
          opacity: 0.5;
        }

        .selection-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.5rem;
          border-top: 1.5px solid rgba(228, 225, 222, 0.12);
          margin-top: auto;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .selection-summary span {
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 600;
          background: rgba(218, 93, 101, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }

        .submit-btn {
          padding: 0.9rem 2.5rem;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(218, 93, 101, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.8);
          transform: none;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          width: 100%;
          margin: 0;
          line-height: 1.4;
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
          .form-row { 
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          label {
            font-size: 0.9rem;
            font-weight: 700;
          }

          input {
            padding: 0.95rem 1rem 0.95rem 2.8rem;
            font-size: 1rem;
          }

          select {
            padding: 0.95rem 2.5rem 0.95rem 1rem;
            font-size: 0.88rem;
          }

          /* Hide icon for select on mobile to prevent overlap */
          .input-wrapper:has(select) .input-icon {
            display: none;
          }
          
          .input-icon {
            left: 1rem;
            width: 18px;
            height: 18px;
          }
          
          .form-group {
            gap: 0.65rem;
          }
          .member-inputs {
            grid-template-columns: 1fr;
          }
          .member-row {
            align-items: flex-start;
          }
          .events-selection-grid {
             grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          }
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
