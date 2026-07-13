import { useState, useEffect } from 'react';
import { loansAPI, financialAPI } from '../services/api';
import { PlusCircle, Trash2, Edit2, AlertTriangle, TrendingDown, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';

const LOAN_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Business Loan', 'Other'];

const PriorityBadge = ({ level }) => (
  <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
);

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [form, setForm] = useState({ loan_name: '', loan_type: 'Personal Loan', lender_name: '', outstanding_amount: '', monthly_emi: '', interest_rate: '', overdue_months: 0, due_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settlementResults, setSettlementResults] = useState({});
  const [loadingSettlement, setLoadingSettlement] = useState(null);

  const fetchLoans = async () => {
    try {
      const { data } = await loansAPI.getAll();
      setLoans(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(); }, []);

  const openModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setForm({ loan_name: loan.loan_name, loan_type: loan.loan_type, lender_name: loan.lender_name, outstanding_amount: loan.outstanding_amount, monthly_emi: loan.monthly_emi, interest_rate: loan.interest_rate, overdue_months: loan.overdue_months, due_date: loan.due_date || '' });
    } else {
      setEditingLoan(null);
      setForm({ loan_name: '', loan_type: 'Personal Loan', lender_name: '', outstanding_amount: '', monthly_emi: '', interest_rate: '', overdue_months: 0, due_date: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, outstanding_amount: parseFloat(form.outstanding_amount), monthly_emi: parseFloat(form.monthly_emi), interest_rate: parseFloat(form.interest_rate), overdue_months: parseInt(form.overdue_months) };
    try {
      if (editingLoan) await loansAPI.update(editingLoan.id, payload);
      else await loansAPI.add(payload);
      setShowModal(false);
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save loan.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan?')) return;
    await loansAPI.delete(id);
    fetchLoans();
  };

  const getSettlement = async (loanId) => {
    setLoadingSettlement(loanId);
    try {
      const { data } = await financialAPI.getSettlement(loanId);
      setSettlementResults(prev => ({ ...prev, [loanId]: data }));
    } catch (e) { console.error(e); } finally { setLoadingSettlement(null); }
  };

  const formatCurrency = (v) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Loan Management</h1>
            <p>Track, prioritize, and manage your outstanding loan portfolio</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <PlusCircle size={15} /> Add Loan
          </button>
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <TrendingDown size={48} />
            <h3>No loans added yet</h3>
            <p>Add your first loan to start tracking and managing your debt portfolio</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => openModal()}>
              <PlusCircle size={15} /> Add Your First Loan
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loans.map((loan) => {
            const settlement = settlementResults[loan.id];
            return (
              <div key={loan.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{loan.loan_name}</h3>
                      <PriorityBadge level={loan.priority_level} />
                      <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{loan.loan_type}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {loan.lender_name} • Priority Score: <strong>{loan.priority_score?.toFixed(1)}</strong>
                      {loan.overdue_months > 0 && <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>⚠ {loan.overdue_months} months overdue</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openModal(loan)}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(loan.id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Outstanding', value: formatCurrency(loan.outstanding_amount), color: '#ef4444' },
                    { label: 'Monthly EMI', value: formatCurrency(loan.monthly_emi), color: '#f59e0b' },
                    { label: 'Interest Rate', value: `${loan.interest_rate}% p.a.`, color: '#8b5cf6' },
                    { label: 'Due Date', value: loan.due_date || 'Not set', color: '#94a3b8' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Settlement section */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  {!settlement ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => getSettlement(loan.id)} disabled={loadingSettlement === loan.id}>
                      <BarChart2 size={13} />
                      {loadingSettlement === loan.id ? 'Calculating...' : 'Get Settlement Recommendation'}
                    </button>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div style={{ background: 'var(--success-glow)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #10b98133' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>Recommended Settlement</div>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(settlement.recommended_amount)}</div>
                      </div>
                      <div style={{ background: 'var(--accent-glow)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-glow)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>Settlement %</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{settlement.settlement_percentage}%</div>
                      </div>
                      <div style={{ background: 'var(--purple-glow)', borderRadius: '8px', padding: '10px 12px', border: '1px solid #8b5cf633' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>Prediction</div>
                        <div style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.8rem' }}>{settlement.settlement_prediction}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingLoan ? 'Edit Loan' : 'Add New Loan'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Loan Name</label>
                  <input className="form-input" placeholder="e.g. HDFC Personal Loan" value={form.loan_name} onChange={e => setForm({ ...form, loan_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Loan Type</label>
                  <select className="form-select" value={form.loan_type} onChange={e => setForm({ ...form, loan_type: e.target.value })}>
                    {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Lender Name</label>
                <input className="form-input" placeholder="e.g. HDFC Bank" value={form.lender_name} onChange={e => setForm({ ...form, lender_name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Outstanding Amount (₹)</label>
                  <input className="form-input" type="number" placeholder="e.g. 200000" value={form.outstanding_amount} onChange={e => setForm({ ...form, outstanding_amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly EMI (₹)</label>
                  <input className="form-input" type="number" placeholder="e.g. 5000" value={form.monthly_emi} onChange={e => setForm({ ...form, monthly_emi: e.target.value })} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Interest Rate (% p.a.)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="e.g. 14.5" value={form.interest_rate} onChange={e => setForm({ ...form, interest_rate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Overdue Months</label>
                  <input className="form-input" type="number" min="0" value={form.overdue_months} onChange={e => setForm({ ...form, overdue_months: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingLoan ? 'Update Loan' : 'Add Loan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
