import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(37,99,235,0.06) 0%, transparent 50%), radial-gradient(circle at 75% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', gap: '60px', alignItems: 'center', maxWidth: '980px', width: '100%' }}>
        {/* Left brand panel */}
        <div style={{ flex: 1, display: 'none' }}>
        </div>

        {/* Left hero panel */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FinRelief AI</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Debt Relief Platform</div>
              </div>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Resolve your debt<br/>
              <span className="text-gradient">intelligently</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>
              AI-powered negotiation letters, financial health scoring, and personalized settlement strategies — all in one secure platform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: <Shield size={16} />, color: '#10b981', text: 'Bank-grade security with JWT authentication' },
              { icon: <Zap size={16} />, color: '#f59e0b', text: 'Gemini AI negotiation letters in seconds' },
              { icon: <TrendingUp size={16} />, color: '#2563eb', text: 'Real-time EMI ratio and debt stress tracking' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ color: f.color }}>{f.icon}</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div style={{ width: '400px', flex: '0 0 auto' }}>
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to your account</p>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: '8px' }}>
                {loading ? <div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <LogIn size={16} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <hr className="divider" style={{ marginTop: '24px', marginBottom: '24px' }} />

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
