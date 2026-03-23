import { Mail, Phone, MapPin, Heart, Send, Sparkles, Zap } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
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

  const motivationalQuotes = [
    "Unity in diversity creates champions! 🏆",
    "Every stride you take brings us closer together! 💪",
    "Community spirit is our greatest strength! ✨",
    "When zones unite, magic happens! ✨🌟"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, type: 'spring', bounce: 0.4 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Decorative floating elements
  const FloatingDecor = ({ delay = 0, icon: Icon, color = 'var(--primary)' }) => (
    <motion.div
      variants={floatingVariants}
      animate="animate"
      style={{
        position: 'absolute',
        opacity: 0.1,
        pointerEvents: 'none',
      }}
      transition={{ delay }}
    >
      <Icon size={40} color={color} />
    </motion.div>
  );

  return (
    <div className="page-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <Sparkles size={100} />
      </motion.div>

      {/* Header Section with Enhanced Animation */}
      <AnimatedSection>
        <motion.div className="section-header center-align">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="title" style={{ 
              fontSize: '3.5rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}>
              📞 Get in Touch
            </h1>
          </motion.div>
          <motion.p 
            className="subtitle" 
            style={{ 
              margin: '1rem auto 2rem',
              fontSize: '1.2rem',
              background: 'linear-gradient(90deg, rgba(218, 93, 101, 0.8), rgba(245, 194, 144, 0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your Gateway to Unforgettable Community Celebrations
          </motion.p>
          <motion.div 
            className="divider" 
            style={{ margin: '0 auto' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.div>
      </AnimatedSection>

      {/* Motivational Quote Section with Premium Effects */}
      <AnimatedSection delay={0.1}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
          style={{
            maxWidth: '700px',
            margin: '3rem auto',
            perspective: '1000px',
          }}
        >
          <motion.div
            className="glass-card"
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(245, 194, 144, 0.15) 100%)',
              border: '2px solid var(--primary)',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 30px 60px rgba(218, 93, 101, 0.3)',
              y: -5
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Animated Background Glow */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(218, 93, 101, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
              animate={{ 
                rotate: 360,
                y: [0, -10, 0]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Heart size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
            </motion.div>
            
            <motion.p 
              style={{
                fontSize: '1.6rem',
                fontWeight: '700',
                color: 'var(--primary)',
                margin: '0',
                lineHeight: '1.8',
                position: 'relative',
                zIndex: 1
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {randomQuote}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Contact Cards Section */}
      <AnimatedSection delay={0.2}>
        <motion.div
          style={{
            maxWidth: '1000px',
            margin: '5rem auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            padding: '0 1rem',
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {contactDetails.map((contact, index) => (
            <motion.div key={index} variants={itemVariants}>
              <motion.div
                className="glass-card"
                style={{
                  padding: '2.5rem',
                  borderRadius: '18px',
                  textAlign: 'center',
                  border: '2px solid rgba(218, 93, 101, 0.3)',
                  background: `linear-gradient(135deg, 
                    ${index === 0 ? 'rgba(218, 93, 101, 0.08)' : 'rgba(245, 194, 144, 0.08)'}, 
                    ${index === 0 ? 'rgba(255, 200, 200, 0.06)' : 'rgba(255, 220, 150, 0.06)'})`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ 
                  y: -15,
                  boxShadow: index === 0 
                    ? '0 40px 80px rgba(218, 93, 101, 0.4)' 
                    : '0 40px 80px rgba(245, 194, 144, 0.4)',
                  borderColor: 'var(--primary)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Card Background Animation */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 50%, 
                      ${index === 0 ? 'rgba(218, 93, 101, 0.15)' : 'rgba(245, 194, 144, 0.15)'} 0%, 
                      transparent 70%)`,
                    pointerEvents: 'none'
                  }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                />

                {/* Animated Circle Icon */}
                <motion.div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, 
                      ${index === 0 ? 'var(--primary)' : 'var(--accent)'}, 
                      ${index === 0 ? '#ff8080' : '#ffa040'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: `0 15px 40px ${index === 0 ? 'rgba(218, 93, 101, 0.4)' : 'rgba(245, 194, 144, 0.4)'}`,
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 360,
                  }}
                  transition={{ rotate: { duration: 0.6 } }}
                  variants={pulseVariants}
                  animate="animate"
                >
                  <Phone size={40} color="white" />
                </motion.div>
                
                <motion.h3 
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--text)',
                    margin: '0 0 1rem 0',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {contact.name}
                </motion.h3>

                <motion.p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    margin: '0 0 1.5rem 0',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  Ready to connect? Call us anytime! 📱
                </motion.p>
                
                <motion.a
                  href={`tel:${contact.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.7rem',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    marginTop: '1rem',
                    padding: '1rem 1.8rem',
                    borderRadius: '12px',
                    border: '2.5px solid var(--primary)',
                    position: 'relative',
                    zIndex: 2,
                    background: 'rgba(218, 93, 101, 0.05)',
                    cursor: 'pointer',
                  }}
                  whileHover={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    scale: 1.08,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Phone size={20} />
                  {contact.phone}
                </motion.a>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Call-to-Action Section */}
      <AnimatedSection delay={0.3}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          style={{
            maxWidth: '700px',
            margin: '5rem auto',
            padding: '3rem',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.12) 0%, rgba(200, 100, 255, 0.12) 100%)',
            border: '2px solid rgba(100, 200, 255, 0.3)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 60%)',
            }}
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <motion.div
            animate={{ 
              rotate: [0, 360]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}
          >
            <Zap size={40} style={{ margin: '0 auto', color: 'var(--primary)' }} />
          </motion.div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            Ready to Celebrate? 🎉
          </h3>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            margin: '0',
            position: 'relative',
            zIndex: 1,
          }}>
            Reach out to our coordinators for any queries, sponsorship opportunities, or to be part of this incredible community celebration. We're here to make your experience unforgettable!
          </p>
        </motion.div>
      </AnimatedSection>

      {/* Footer Message */}
      <AnimatedSection delay={0.4}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            maxWidth: '700px',
            margin: '4rem auto 2rem',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            position: 'relative',
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Send size={24} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          </motion.div>
          <p style={{ margin: '0' }}>
            💌 Feel free to reach out with any questions, suggestions, or if you'd like to contribute to making this event even more special!
          </p>
        </motion.div>
      </AnimatedSection>
    </div>
  );
}
