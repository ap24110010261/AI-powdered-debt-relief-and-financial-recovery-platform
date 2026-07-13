import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CreditCard, Bot, BarChart2,
  Activity, LogOut, TrendingUp, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Loan Management', icon: CreditCard, path: '/loans' },
  { label: 'Financial Health', icon: Activity, path: '/financial-health' },
  { label: 'AI Negotiation', icon: Bot, path: '/ai-negotiation' },
  { label: 'Settlements', icon: BarChart2, path: '/settlements' },
  { label: 'Know Your Rights', icon: Shield, path: '/know-your-rights' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={16} color="white" />
          </div>
          <div>
            <h2>FinRelief AI</h2>
            <span>Debt Recovery Platform</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={17} />
              {item.label}
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip" style={{ marginBottom: '10px' }}>
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)', width: '100%' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
