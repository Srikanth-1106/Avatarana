import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactPerson {
  name: string;
  phone: string;
}

export default function Contact() {
  const contactDetails: ContactPerson[] = [
    {
      name: 'Shrivathsa Gumpe',
      phone: '9482974619'
    },
    {
      name: 'Kiran Sajangadde',
      phone: '9686199746'
    }
  ];


  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '0.5rem',
          color: 'var(--primary)',
          fontWeight: '700',
        }}>
          📞 Contact Us
        </h1>
        
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
        }}>
          Reach out to our coordinators
        </p>

        {/* Contact Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
        }}>
          {contactDetails.map((contact, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, 
                    ${index === 0 ? 'rgba(218, 93, 101, 0.12)' : 'rgba(245, 194, 144, 0.12)'}, 
                    ${index === 0 ? 'rgba(255, 200, 200, 0.08)' : 'rgba(255, 220, 150, 0.08)'})`,
                  border: `2px solid ${index === 0 ? 'rgba(218, 93, 101, 0.3)' : 'rgba(245, 194, 144, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--text)',
                    margin: '0 0 0.3rem 0',
                  }}>
                    {contact.name}
                  </h3>
                  <a 
                    href={`tel:${contact.phone}`}
                    style={{
                      textDecoration: 'none',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Phone size={16} />
                    {contact.phone}
                  </a>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, 
                      ${index === 0 ? 'var(--primary)' : 'var(--accent)'}, 
                      ${index === 0 ? '#ff8080' : '#ffa040'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={24} color="white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Text */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
        }}>
          💌 Feel free to call anytime with any questions or suggestions!
        </p>
      </motion.div>
    </div>
  );
}
