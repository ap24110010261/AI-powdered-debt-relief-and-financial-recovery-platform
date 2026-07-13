import { useState, useEffect } from 'react';
import { dashboardAPI, financialAPI } from '../services/api';
import { TrendingUp, CreditCard, AlertTriangle, CheckCircle, DollarSign, Activity, Bot, PlusCircle } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StressIndicator = ({ level }) => {
  const colors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
  const color = colors[level] || '#94a3b8';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ color, fontWeight: 700, fontSize: '0.95rem' }}>{level}</span>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [profileForm, setProfileForm] = useState({ monthly_income: '', monthly_expenses: '', existing_debts: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financialAPI.updateProfile({
        monthly_income: parseFloat(profileForm.monthly_income),
        monthly_expenses: parseFloat(profileForm.monthly_expenses),
        existing_debts: parseFloat(profileForm.existing_debts) || 0
      });
      setShowProfileModal(false);
      fetchStats();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const healthScore = stats?.financial_health_score || 0;
  const healthData = [{ name: 'Health', value: healthScore, fill: healthScore > 60 ? '#10b981' : healthScore > 30 ? '#f59e0b' : '#ef4444' }];

  const emiChartData = stats ? [
    { name: 'Income', value: stats.monthly_income, fill: '#2563eb' },
    { name: 'Expenses', value: stats.monthly_expenses, fill: '#8b5cf6' },
    { name: 'Total EMI', value: stats.monthly_emi_total, fill: '#ef4444' },
    { name: 'Surplus', value: Math.max(0, stats.monthly_surplus), fill: '#10b981' },
  ] : [];

  const formatCurrency = (v) => {
    if (!v && v !== 0) return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong> — here's your financial overview</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowProfileModal(true)}>
            <Activity size={15} /> Update Financial Profile
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><DollarSign size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats?.total_outstanding)}</div>
          <div className="stat-label">Total Outstanding</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={18} /></div>
          <div className="stat-value">{stats?.emi_ratio?.toFixed(1) || '0'}%</div>
          <div className="stat-label">EMI Ratio</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats?.monthly_surplus)}</div>
          <div className="stat-label">Monthly Surplus</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><Bot size={18} /></div>
          <div className="stat-value">{stats?.ai_letters_generated || 0}</div>
          <div className="stat-label">AI Letters Generated</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Health Score */}
        <div className="chart-container">
          <div className="chart-title">Financial Health Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={10} data={healthData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={5} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: healthScore > 60 ? '#10b981' : healthScore > 30 ? '#f59e0b' : '#ef4444' }}>
                {healthScore.toFixed(0)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>out of 100</div>
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>STRESS LEVEL</div>
                <StressIndicator level={stats?.stress_level || 'Low'} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Total Loans', value: stats?.total_loans || 0, color: '#2563eb' },
              { label: 'High Priority', value: stats?.high_priority_loans || 0, color: '#ef4444' },
              { label: 'DTI Ratio', value: `${stats?.debt_to_income_ratio?.toFixed(1) || 0}%`, color: '#f59e0b' },
              { label: 'Monthly EMI', value: formatCurrency(stats?.monthly_emi_total), color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly breakdown chart */}
        <div className="chart-container">
          <div className="chart-title">Monthly Breakdown</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={emiChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#141c2e', border: '1px solid #1e2d4a', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={(v) => [formatCurrency(v), '']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563eb">
                {emiChartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Add New Loan', icon: <PlusCircle size={15} />, color: 'btn-primary', action: () => navigate('/loans') },
            { label: 'Generate AI Letter', icon: <Bot size={15} />, color: 'btn-success', action: () => navigate('/ai-negotiation') },
            { label: 'View Settlements', icon: <CheckCircle size={15} />, color: 'btn-ghost', action: () => navigate('/settlements') },
            { label: 'View Loan List', icon: <CreditCard size={15} />, color: 'btn-ghost', action: () => navigate('/loans') },
          ].map((a, i) => (
            <button key={i} className={`btn ${a.color}`} onClick={a.action}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProfileModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Update Financial Profile</div>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Enter your current financial details to calculate your real-time debt stress index and surplus.
            </p>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Monthly Income (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 55000" value={profileForm.monthly_income} onChange={e => setProfileForm({ ...profileForm, monthly_income: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Expenses (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 25000" value={profileForm.monthly_expenses} onChange={e => setProfileForm({ ...profileForm, monthly_expenses: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Other Existing Monthly Debts (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 5000 (optional)" value={profileForm.existing_debts} onChange={e => setProfileForm({ ...profileForm, existing_debts: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
