import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Home } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (adminLogin(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div
        className="glass-card"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '3rem',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Lock size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Admin Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Access the Avatarana Admin Dashboard
          </p>
        </div>

        {error && (
          <motion.div
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              background: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'start',
              color: '#ff6464',
              fontSize: '0.9rem',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(228, 225, 222, 0.2)',
                borderRadius: '8px',
                background: 'rgba(228, 225, 222, 0.05)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.background = 'rgba(228, 225, 222, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(228, 225, 222, 0.2)';
                e.target.style.background = 'rgba(228, 225, 222, 0.05)';
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(228, 225, 222, 0.2)',
                borderRadius: '8px',
                background: 'rgba(228, 225, 222, 0.05)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.background = 'rgba(228, 225, 222, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(228, 225, 222, 0.2)';
                e.target.style.background = 'rgba(228, 225, 222, 0.05)';
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.875rem 1.5rem',
              marginTop: '0.5rem',
              background: loading ? 'rgba(220, 93, 101, 0.6)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(220, 93, 101, 0.9)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              marginTop: '1rem',
              background: 'transparent',
              color: 'var(--primary)',
              border: '2px solid var(--primary)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 93, 101, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Home size={18} />
            Back to Home
          </button>
        </form>
      </motion.div>
    </div>
  );
}
