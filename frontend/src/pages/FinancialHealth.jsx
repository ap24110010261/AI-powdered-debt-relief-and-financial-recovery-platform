import { useState, useEffect } from 'react';
import { financialAPI } from '../services/api';
import { Activity, TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const MetricCard = ({ label, value, color, icon, note }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ color }}>{icon}</div>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
    {note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{note}</div>}
  </div>
);

export default function FinancialHealth() {
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ monthly_income: '', monthly_expenses: '', existing_debts: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([financialAPI.getProfile(), financialAPI.getHealth()]);
      setProfile(pRes.data);
      setHealth(hRes.data);
      setForm({
        monthly_income: pRes.data.monthly_income || '',
        monthly_expenses: pRes.data.monthly_expenses || '',
        existing_debts: pRes.data.existing_debts || ''
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await financialAPI.updateProfile({
        monthly_income: parseFloat(form.monthly_income),
        monthly_expenses: parseFloat(form.monthly_expenses),
        existing_debts: parseFloat(form.existing_debts) || 0
      });
      setSuccess('Financial profile updated successfully!');
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const formatCurrency = (v) => v ? '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0';

  // EMI gauge chart data
  const gaugeData = health ? [
    { month: 'You', emi_ratio: health.emi_ratio },
    { month: 'Ideal', emi_ratio: 30 },
    { month: 'Warning', emi_ratio: 50 },
  ] : [];

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  const stressColor = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
  const sColor = stressColor[health?.stress_level] || '#94a3b8';

  return (
    <div>
      <div className="page-header">
        <h1>Financial Health Center</h1>
        <p>Your personalized debt stress index, income analysis, and recovery metrics</p>
      </div>

      {/* Key metrics */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <MetricCard label="Monthly Income" value={formatCurrency(profile?.monthly_income)} color="#2563eb" icon={<TrendingUp size={16} />} note="Your gross monthly earnings" />
        <MetricCard label="Monthly Expenses" value={formatCurrency(profile?.monthly_expenses)} color="#8b5cf6" icon={<Activity size={16} />} note="Fixed + variable costs" />
        <MetricCard label="Monthly Surplus" value={formatCurrency(health?.monthly_surplus)} color={health?.monthly_surplus > 0 ? '#10b981' : '#ef4444'} icon={health?.monthly_surplus > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} note={health?.monthly_surplus > 0 ? 'Available for repayment' : 'Deficit — restructuring needed'} />
        <MetricCard label="EMI Ratio" value={`${health?.emi_ratio?.toFixed(1) || 0}%`} color={health?.emi_ratio < 30 ? '#10b981' : health?.emi_ratio < 50 ? '#f59e0b' : '#ef4444'} icon={<Zap size={16} />} note="Target: below 30%" />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Stress Index */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: '20px' }}>Debt Stress Index</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(${sColor} ${(health?.emi_ratio || 0) * 3.6}deg, var(--bg-secondary) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 58, height: 58, background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: sColor }}>
                {health?.emi_ratio?.toFixed(0) || 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stress Level</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: sColor }}>{health?.stress_level || 'N/A'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {health?.stress_level === 'Low' ? 'Your debt burden is manageable' :
                 health?.stress_level === 'Medium' ? 'Moderate stress — action recommended' :
                 'High stress — immediate attention needed'}
              </div>
            </div>
          </div>

          {[
            { label: 'EMI-to-Income Ratio', value: `${health?.emi_ratio?.toFixed(2) || 0}%`, threshold: '< 30% (Healthy)', color: health?.emi_ratio < 30 ? '#10b981' : '#ef4444' },
            { label: 'Debt-to-Income Ratio', value: `${health?.debt_to_income_ratio?.toFixed(2) || 0}%`, threshold: '< 200% (Manageable)', color: health?.debt_to_income_ratio < 200 ? '#10b981' : '#ef4444' },
            { label: 'Financial Health Score', value: `${health?.financial_health_score?.toFixed(1) || 0} / 100`, threshold: '> 60 (Good)', color: health?.financial_health_score > 60 ? '#10b981' : health?.financial_health_score > 30 ? '#f59e0b' : '#ef4444' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="progress-bar" style={{ flex: 1, marginRight: '8px' }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, parseFloat(item.value))}%`, background: item.color === '#10b981' ? 'var(--gradient-green)' : item.color === '#f59e0b' ? 'var(--gradient-orange)' : 'var(--gradient-red)' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.threshold}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Update Profile Form */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: '20px' }}>Update Profile</div>
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Monthly Income (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 55000" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Expenses (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 25000" value={form.monthly_expenses} onChange={e => setForm({ ...form, monthly_expenses: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Existing Monthly Debt Payments (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 5000 (optional)" value={form.existing_debts} onChange={e => setForm({ ...form, existing_debts: e.target.value })} />
            </div>

            <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-glow)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertTriangle size={14} color="var(--warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Accurate income and expense data is crucial for generating reliable settlement recommendations and negotiation letters.
                </p>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : 'Update Financial Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
