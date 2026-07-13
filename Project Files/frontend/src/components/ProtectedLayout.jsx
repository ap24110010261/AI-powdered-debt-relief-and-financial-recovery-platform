import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading FinRelief AI...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
