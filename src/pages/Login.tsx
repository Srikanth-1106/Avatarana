import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="glass-card auth-card animate-slide-up">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn size={32} className="icon-primary" />
          </div>
          <h1 className="title highlight" style={{ fontSize: '2.5rem' }}>Welcome Back</h1>
          <p className="subtitle">Login to your account to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                id="email" 
                required 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                id="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="highlight">Sign up</Link></p>
        </div>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .auth-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .auth-icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(218, 93, 101, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(218, 93, 101, 0.2);
          margin-bottom: 0.5rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-error {
          background: rgba(220, 38, 38, 0.1);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid rgba(220, 38, 38, 0.2);
          text-align: center;
        }

        .auth-btn {
          width: 100%;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .auth-footer {
          text-align: center;
          color: var(--muted);
          font-size: 0.95rem;
        }

        .auth-footer a {
          text-decoration: none;
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
