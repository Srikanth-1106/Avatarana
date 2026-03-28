import { useState } from 'react';
import { Clock, MapPin, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export default function Schedule() {
  const [activeDay, setActiveDay] = useState(1);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);





  const day1Data = [
    { time: '08:00 AM', event: 'Opening Ceremony & Torch Relay', location: 'Main Stadium', category: 'General', details: 'A grand kick-off featuring traditional lamp lighting and our symbolic community torch relay through the arena.' },
    { time: '09:00 AM', event: 'Kids 50m & 100m Races', location: 'Track A', category: 'Kids', details: 'Speed trials for our youngest stars. Categories divided into LKG-1st, 2nd-5th, and 6th-10th Std.' },
    { time: '10:30 AM', event: 'Men\'s Volleyball Preliminaries', location: 'Court 1 & 2', category: 'Men', details: 'Regional teams battle it out in the qualifying rounds. Best of 3 sets.' },
    { time: '11:00 AM', event: 'Women\'s Throwball & Dodgeball', location: 'Court 3 & 4', category: 'Women', details: 'High-energy team sports for women. Come cheer for your zone!' },
    { time: '01:00 PM', event: 'Lunch Break & Community Gather', location: 'Food Court', category: 'General', details: 'A perfect time for socializing and enjoying authentic Karada community cuisine.' },
    { time: '02:00 PM', event: 'Senior Citizens Fast Walking', location: 'Track B', category: 'Senior', details: 'A display of fitness and spirit by our revered elders. Strict walking rules apply!' },
    { time: '03:30 PM', event: 'Cooking Without Fire', location: 'Hall A', category: 'General', details: 'Creative culinary competition. Participants craft amazing dishes without any heat source.' },
    { time: '05:00 PM', event: 'Tug of War & Lagori Finals', location: 'Main Arena', category: 'Men/Women', details: 'The grand finals for the most traditional and exciting team events.' },
    { time: '07:30 PM', event: 'Closing Ceremony & Prizes', location: 'Main Stage', category: 'General', details: 'Awarding the Champions of Day 1 and cultural performances.' },
  ];

  const day2Data = [
    { time: '09:00 AM', event: 'Cricket Championship Finals', location: 'Main Arena', category: 'Men', details: 'The final showdown between the top two regional cricket teams.' },
    { time: '11:00 AM', event: 'Kannada Crossword Challenge', location: 'Hall B', category: 'Senior', details: 'A mental agility contest featuring the beloved "Padabandha" puzzles.' },
    { time: '01:00 PM', event: 'Grand Feast (Bhojana)', location: 'Food Court', category: 'General', details: 'Traditional community meal for all registered participants and guests.' },
    { time: '03:00 PM', event: 'Cultural Showcase & Talent Hunt', location: 'Grand Ballroom', category: 'General', details: 'Music, dance, and variety performances by talented members of our community.' },
    { time: '06:00 PM', event: 'Grand Finale & Championship Trophy', location: 'Main Arena', category: 'General', details: 'The ultimate award ceremony where the Overall Championship zone is crowned!' },
  ];

  const currentData = activeDay === 1 ? day1Data : day2Data;

  return (
    <div className="page-container" style={{maxWidth: '850px'}}>
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Event Schedule</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>Plan your perfect festival day. Click events for more info.</p>
        
        <div className="timeline-tabs" style={{marginBottom: '3rem'}}>
          <button 
            className={`tab-btn ${activeDay === 1 ? 'active' : ''}`}
            onClick={() => { setActiveDay(1); setExpandedItem(null); }}
          >
            <Calendar size={18} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} />
            April 18 (Day 1)
          </button>
          <button 
            className={`tab-btn ${activeDay === 2 ? 'active' : ''}`}
            onClick={() => { setActiveDay(2); setExpandedItem(null); }}
          >
            <Calendar size={18} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} />
            April 19 (Day 2)
          </button>
        </div>
        
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      <div className="schedule-timeline">
        {currentData.map((item, index) => (
          <div 
            key={index} 
            className={`timeline-item glass-card expandable ${expandedItem === index ? 'active-item' : ''}`}
            onClick={() => setExpandedItem(expandedItem === index ? null : index)}
          >
            <div className="time-block">
              <Clock size={20} className="icon-secondary" />
              <span className="time-text">{item.time}</span>
            </div>
            
            <div className="event-details">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 className="event-name">{item.event}</h3>
                {expandedItem === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              <div className="event-meta">
                <span className="meta-item"><MapPin size={16} /> {item.location}</span>
                <span className="meta-badge">{item.category}</span>
              </div>
              
              {expandedItem === index && (
                <div className="event-details-expanded">
                  {item.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .center-align { text-align: center; }
        .schedule-timeline { display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
        .schedule-timeline::before { content: ''; position: absolute; left: 120px; top: 20px; bottom: 20px; width: 2px; background: rgba(218, 93, 101, 0.2); z-index: 0; }
        .timeline-item { display: flex; gap: 2rem; align-items: flex-start; padding: 2rem; position: relative; z-index: 1; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .timeline-item.active-item { border-color: var(--primary); background: rgba(218, 93, 101, 0.05); }
        .time-block { min-width: 100px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--text-main); font-weight: 700; margin-top: 0.25rem; }
        .event-details { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
        .event-name { margin: 0; font-size: 1.5rem; color: var(--text-main); font-weight: 700; }
        .event-meta { display: flex; align-items: center; gap: 1.5rem; font-size: 0.9rem; color: var(--muted); }
        .meta-item { display: flex; align-items: center; gap: 0.4rem; }
        .meta-badge { background: rgba(228, 225, 222, 0.1); padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 600; color: var(--secondary); font-size: 0.8rem; }
        @media (max-width: 600px) { .schedule-timeline::before { display: none; } .timeline-item { flex-direction: column; align-items: flex-start; gap: 1.5rem; padding: 1.5rem; } .time-block { flex-direction: row; min-width: auto; } }
      `}</style>
    </div>
  );
}
