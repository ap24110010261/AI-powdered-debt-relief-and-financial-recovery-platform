import { useState, useEffect } from 'react';
import { loansAPI, aiAPI } from '../services/api';
import { Bot, Copy, Download, Trash2, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';

const HARDSHIP_OPTIONS = [
  'Job Loss / Unemployment',
  'Medical Emergency',
  'Business Failure',
  'Family Emergency',
  'Natural Disaster',
  'Pay Cut / Salary Reduction',
  'Divorce / Family Separation',
  'Education Expenses',
  'Other Financial Hardship'
];

const TONES = ['Professional', 'Hardship', 'Urgent'];

export default function AINegotiation() {
  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [hardship, setHardship] = useState('Job Loss / Unemployment');
  const [tone, setTone] = useState('Professional');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [currentLetter, setCurrentLetter] = useState(null);

  const fetchData = async () => {
    const [loansRes, historyRes] = await Promise.all([loansAPI.getAll(), aiAPI.getHistory()]);
    setLoans(loansRes.data);
    setHistory(historyRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedLoan) { setError('Please select a loan first.'); return; }
    setGenerating(true);
    setError('');
    setCurrentLetter(null);
    try {
      const { data } = await aiAPI.generate({
        loan_id: parseInt(selectedLoan),
        hardship_reason: hardship,
        tone
      });
      setCurrentLetter(data);
      fetchData(); // refresh history
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate letter. Please try again.');
    } finally { setGenerating(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadLetter = (letter, lenderName) => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Negotiation_Letter_${lenderName?.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await aiAPI.deleteHistory(id);
    fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Negotiation Engine</h1>
        <p>Generate professional, personalized debt negotiation letters powered by Google Gemini AI</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Generator panel */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-header">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-light)" />
                Generate Negotiation Letter
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Select Loan Account</label>
                <select className="form-select" value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)} required>
                  <option value="">-- Choose a loan --</option>
                  {loans.map(loan => (
                    <option key={loan.id} value={loan.id}>
                      {loan.loan_name} — {loan.lender_name} (₹{Number(loan.outstanding_amount).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hardship Reason</label>
                <select className="form-select" value={hardship} onChange={e => setHardship(e.target.value)}>
                  {HARDSHIP_OPTIONS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Letter Tone</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {TONES.map(t => (
                    <button key={t} type="button"
                      onClick={() => setTone(t)}
                      className={`btn btn-sm ${tone === t ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex: 1, justifyContent: 'center' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-success" disabled={generating || !selectedLoan} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}>
                {generating ? (
                  <><div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating with AI...</>
                ) : (
                  <><Bot size={16} /> Generate Letter</>
                )}
              </button>
            </form>
          </div>

          {/* Current letter result */}
          {currentLetter && (
            <div className="card" style={{ border: '1px solid #10b98133' }}>
              <div className="section-header">
                <div className="section-title" style={{ color: 'var(--success)' }}>✓ Letter Generated</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(currentLetter.settlement_letter)}>
                    <Copy size={13} /> Copy
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => downloadLetter(currentLetter.settlement_letter, currentLetter.lender_name)}>
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>

              {currentLetter.negotiation_strategy && (
                <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-glow)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strategy Summary</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{currentLetter.negotiation_strategy}</div>
                </div>
              )}

              <div className="letter-box">{currentLetter.settlement_letter}</div>
            </div>
          )}
        </div>

        {/* History panel */}
        <div>
          <div className="card">
            <div className="section-header">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} /> Generation History
              </div>
              <span className="badge badge-blue">{history.length}</span>
            </div>

            {history.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Bot size={36} />
                <h3>No letters generated yet</h3>
                <p>Generate your first negotiation letter using the form</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map(record => (
                  <div key={record.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', cursor: 'pointer' }}
                      onClick={() => setExpandedHistory(expandedHistory === record.id ? null : record.id)}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{record.lender_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {record.hardship_reason} • {new Date(record.generated_at).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDeleteHistory(record.id); }}>
                          <Trash2 size={12} />
                        </button>
                        {expandedHistory === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {expandedHistory === record.id && (
                      <div style={{ padding: '0 14px 14px' }}>
                        {record.negotiation_strategy && (
                          <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-glow)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Strategy</div>
                            <div style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{record.negotiation_strategy}</div>
                          </div>
                        )}
                        <div className="letter-box" style={{ maxHeight: '200px' }}>{record.settlement_letter}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(record.settlement_letter)}>
                            <Copy size={12} /> Copy
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => downloadLetter(record.settlement_letter, record.lender_name)}>
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
