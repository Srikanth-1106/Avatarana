import { Clock, MapPin } from 'lucide-react';

export default function Schedule() {
  const scheduleData = [
    { time: '08:00 AM', event: 'Opening Ceremony & Torch Relay', location: 'Main Stadium', category: 'General' },
    { time: '09:00 AM', event: 'Kids 50m & 100m Races', location: 'Track A', category: 'Kids' },
    { time: '10:30 AM', event: 'Men\'s Volleyball Preliminaries', location: 'Court 1 & 2', category: 'Men' },
    { time: '11:00 AM', event: 'Women\'s Throwball & Dodgeball', location: 'Court 3 & 4', category: 'Women' },
    { time: '01:00 PM', event: 'Lunch Break & Community Gather', location: 'Food Court', category: 'General' },
    { time: '02:00 PM', event: 'Senior Citizens Fast Walking', location: 'Track B', category: 'Senior' },
    { time: '03:30 PM', event: 'Cooking Without Fire', location: 'Hall A', category: 'General' },
    { time: '05:00 PM', event: 'Tug of War & Lagori Finals', location: 'Main Arena', category: 'Men/Women' },
    { time: '07:30 PM', event: 'Closing Ceremony & Prizes', location: 'Main Stage', category: 'General' },
  ];

  return (
    <div className="page-container" style={{maxWidth: '800px'}}>
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Event Schedule</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>Plan your perfect festival day.</p>
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      <div className="schedule-timeline">
        {scheduleData.map((item, index) => (
          <div key={index} className="timeline-item glass-card">
            <div className="time-block">
              <Clock size={20} className="icon-secondary" />
              <span className="time-text">{item.time}</span>
            </div>
            
            <div className="event-details">
              <h3 className="event-name">{item.event}</h3>
              <div className="event-meta">
                <span className="meta-item"><MapPin size={16} /> {item.location}</span>
                <span className="meta-badge">{item.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .center-align { text-align: center; }
        .schedule-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }
        .schedule-timeline::before {
          content: '';
          position: absolute;
          left: 120px;
          top: 20px;
          bottom: 20px;
          width: 2px;
          background: rgba(218, 93, 101, 0.2);
          z-index: 0;
        }
        
        .timeline-item {
          display: flex;
          gap: 2rem;
          align-items: center;
          padding: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .time-block {
          min-width: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-main);
          font-weight: 600;
        }

        .event-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .event-name {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-main);
        }
        
        .event-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          font-size: 0.875rem;
          color: var(--muted);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .meta-badge {
          background: rgba(228, 225, 222, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-weight: 500;
          color: var(--secondary);
        }

        @media (max-width: 600px) {
          .schedule-timeline::before { display: none; }
          .timeline-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .time-block { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}
