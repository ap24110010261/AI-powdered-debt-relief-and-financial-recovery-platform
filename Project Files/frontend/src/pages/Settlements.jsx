import { useState, useEffect } from 'react';
import { financialAPI, loansAPI } from '../services/api';
import { CheckCircle, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Settlements() {
  const [settlements, setSettlements] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const fetchData = async () => {
    try {
      const [sRes, lRes] = await Promise.all([financialAPI.getAllSettlements(), loansAPI.getAll()]);
      setSettlements(sRes.data);
      setLoans(lRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const generateAll = async () => {
    for (const loan of loans) {
      setGenerating(loan.id);
      try { await financialAPI.getSettlement(loan.id); } catch (e) { console.error(e); }
    }
    setGenerating(null);
    fetchData();
  };

  const formatCurrency = (v) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const pieData = settlements.reduce((acc, s) => {
    const existing = acc.find(a => a.name === s.priority_level);
    if (existing) existing.value++;
    else acc.push({ name: s.priority_level, value: 1 });
    return acc;
  }, []);

  const PIE_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Settlement Recommendations</h1>
            <p>AI-powered settlement analysis for each of your active loans</p>
          </div>
          {loans.length > 0 && (
            <button className="btn btn-primary" onClick={generateAll} disabled={generating !== null}>
              <Zap size={14} />
              {generating !== null ? 'Analyzing...' : 'Analyze All Loans'}
            </button>
          )}
        </div>
      </div>

      {settlements.length > 0 && (
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div className="chart-container">
            <div className="chart-title">Settlement Priority Distribution</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#141c2e', border: '1px solid #1e2d4a', borderRadius: '10px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: '16px' }}>Settlement Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Records</span>
                <span style={{ fontWeight: 700 }}>{settlements.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--danger-glow)', borderRadius: '10px', border: '1px solid #ef444433' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Outstanding</span>
                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(loans.reduce((sum, l) => sum + l.outstanding_amount, 0))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--success-glow)', borderRadius: '10px', border: '1px solid #10b98133' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Recommended Settlement</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(settlements.reduce((sum, s) => sum + s.recommended_amount, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {settlements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <BarChart2 size={48} />
            <h3>No settlement analysis yet</h3>
            <p>Click "Analyze All Loans" or go to the Loans page and generate individual recommendations</p>
            {loans.length > 0 && (
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={generateAll}>
                <Zap size={14} /> Analyze All {loans.length} Loan{loans.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="section-title" style={{ marginBottom: '20px' }}>Settlement Records</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Loan</th>
                  <th>Outstanding</th>
                  <th>Recommended</th>
                  <th>Settlement %</th>
                  <th>Prediction</th>
                  <th>Priority</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => {
                  const loan = loans.find(l => l.id === s.loan_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{loan?.loan_name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan?.lender_name || '—'}</div>
                      </td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(loan?.outstanding_amount || 0)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(s.recommended_amount)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ width: '60px' }}>
                            <div className="progress-fill" style={{ width: `${s.settlement_percentage}%`, background: 'var(--gradient-green)' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.settlement_percentage}%</span>
                        </div>
                      </td>
                      <td><span className="badge badge-purple">{s.settlement_prediction}</span></td>
                      <td><span className={`badge badge-${s.priority_level?.toLowerCase()}`}>{s.priority_level}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(s.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
