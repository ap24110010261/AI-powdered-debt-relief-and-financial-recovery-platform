import React from 'react';

export default function KnowYourRights() {
  const rights = [
    {
      icon: '🚫',
      title: 'No Harassment',
      description: 'Recovery agents CANNOT call you before 7 AM or after 7 PM. Threats, abuse, or use of force is illegal under RBI guidelines.'
    },
    {
      icon: '📋',
      title: 'Right to Statement',
      description: 'You have the right to receive a full and detailed loan account statement at any time, free of charge.'
    },
    {
      icon: '🛡️',
      title: 'Settlement Negotiation',
      description: 'You can negotiate a one-time settlement with your lender. Lenders are allowed to accept partial payments to close an NPA account.'
    },
    {
      icon: '🔔',
      title: 'Advance Notice Required',
      description: 'Lenders must give you 60-day advance notice before classifying your account as NPA (Non-Performing Asset).'
    },
    {
      icon: '⚖️',
      title: 'Grievance Redressal',
      description: 'Every bank must have a Grievance Redressal Officer. You can escalate to RBI Banking Ombudsman if unresolved in 30 days.'
    },
    {
      icon: '📄',
      title: 'NOC After Settlement',
      description: 'After full payment or settlement, you are legally entitled to a No-Objection Certificate (NOC) from the lender.'
    },
    {
      icon: '🏠',
      title: 'Property Protection',
      description: "Lenders cannot seize your property without following SARFAESI Act procedures. You have the right to challenge auction notices."
    },
    {
      icon: '👤',
      title: 'Privacy Rights',
      description: 'Recovery agents cannot contact your family, employer, or neighbors to pressure you for repayment.'
    }
  ];

  const steps = [
    { num: '01', title: 'Document Everything', desc: 'Keep records of all calls, letters, and communications from lenders and recovery agents.' },
    { num: '02', title: 'Request Written Settlement', desc: 'Ask for any settlement offer in writing before making any payment.' },
    { num: '03', title: 'File a Complaint', desc: 'If harassed, file a complaint with RBI Ombudsman at cms.rbi.org.in or call 14448.' },
    { num: '04', title: 'Get Legal Help', desc: 'Consult a debt settlement lawyer for large amounts. Many offer free initial consultations.' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🧑‍⚖️ Know Your Rights</h1>
        <p>RBI guidelines and legal protections for Indian borrowers</p>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>✊ You Have Rights as a Borrower</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px', fontSize: '0.9rem' }}>
          Under RBI's Fair Practices Code and the SARFAESI Act, lenders and recovery agents must
          follow strict rules. Knowing these rights protects you from illegal harassment and helps you
          negotiate from a position of strength.
        </p>
      </div>

      {/* Rights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {rights.map((right, i) => (
          <div key={i} className="card" style={{ padding: '20px', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{right.icon}</div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{right.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{right.description}</p>
          </div>
        ))}
      </div>

      {/* What to do if harassed */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>🛡️ What To Do If Harassed</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Step-by-step protection guide</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--border)', marginBottom: '12px' }}>{step.num}</div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RBI Ombudsman Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>📞</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>RBI Banking Ombudsman</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Toll-free: <strong style={{ color: 'var(--accent-light)' }}>14448</strong> &nbsp;•&nbsp; Website:{' '}
            <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>cms.rbi.org.in</a>
          </p>
        </div>
        <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer" className="btn btn-primary">
          File Complaint →
        </a>
      </div>
    </div>
  );
}
