import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import AINegotiation from './pages/AINegotiation';
import Settlements from './pages/Settlements';
import FinancialHealth from './pages/FinancialHealth';
import KnowYourRights from './pages/KnowYourRights';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path="/loans" element={
            <ProtectedLayout>
              <Loans />
            </ProtectedLayout>
          } />
          <Route path="/financial-health" element={
            <ProtectedLayout>
              <FinancialHealth />
            </ProtectedLayout>
          } />
          <Route path="/ai-negotiation" element={
            <ProtectedLayout>
              <AINegotiation />
            </ProtectedLayout>
          } />
          <Route path="/settlements" element={
            <ProtectedLayout>
              <Settlements />
            </ProtectedLayout>
          } />
          <Route path="/know-your-rights" element={
            <ProtectedLayout>
              <KnowYourRights />
            </ProtectedLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
