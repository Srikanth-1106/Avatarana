import { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsData } from '../data/eventsData';
import { Medal } from 'lucide-react';

export default function Events() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Men', 'Women', 'Kids', 'Senior Citizens', 'General'];

  const filteredEvents = activeCategory === 'All' 
    ? eventsData 
    : eventsData.filter(e => e.category === activeCategory);

  return (
    <div className="page-container">
      <div className="section-header center-align">
        <h1 className="title" style={{fontSize: '3rem'}}>Event Categories</h1>
        <p className="subtitle" style={{margin: '1rem auto 2rem'}}>Explore our 20+ exciting competitions</p>
        <div className="divider" style={{margin: '0 auto'}}></div>
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <Link 
            key={event.id} 
            to={`/register?event=${event.id}`} 
            className="event-card-link"
          >
            <div className="event-card glass-card">
              <div className="event-header">
                <span className="event-badge">{event.type === 'Group' ? 'GROUP' : 'INDIVIDUAL'}</span>
                {event.type === 'Group' && <span className="badge-captain">CAPTAIN ONLY</span>}
              </div>
              <h3 className="event-title">{event.name}</h3>
              <p className="event-desc">{event.description}</p>
              
              <div className="event-points">
                <Medal size={16} className="icon-primary"/>
                <span>Points: 1st ({event.points.first}) | 2nd ({event.points.second}) {event.points.third && `| 3rd (${event.points.third})`}</span>
              </div>
              <div className="event-footer">
                <span className="register-now">Register for this event →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .center-align { text-align: center; }
        .category-filters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .filter-btn {
          background: rgba(228, 225, 222, 0.05);
          border: 1px solid rgba(228, 225, 222, 0.1);
          color: var(--text-main);
          padding: 0.75rem 1.5rem;
          border-radius: 99px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          background: rgba(228, 225, 222, 0.1);
        }
        .filter-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--bg-main);
        }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .event-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.3s ease;
        }
        .event-card-link:hover {
          transform: translateY(-8px);
        }
        .event-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }
        .event-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(228, 225, 222, 0.05);
        }
        .register-now {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
          transition: opacity 0.2s;
        }
        .event-card-link:hover .register-now {
          opacity: 0.8;
        }
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          gap: 0.5rem;
        }
        .event-badge {
          color: var(--secondary);
          background: rgba(92, 158, 156, 0.12);
          padding: 0.35rem 0.65rem;
          border-radius: 4px;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }
        .badge-captain {
          background: rgba(218, 93, 101, 0.15);
          color: var(--primary);
          padding: 0.35rem 0.65rem;
          border-radius: 4px;
          font-size: 0.65rem;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .event-title {
          font-size: 1.5rem;
          margin: 0;
          color: var(--text-main);
        }
        .event-desc {
          color: var(--muted);
          line-height: 1.5;
          flex: 1;
        }
        .event-points {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-main);
          background: rgba(218, 93, 101, 0.05);
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}
