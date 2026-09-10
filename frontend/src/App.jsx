import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Automations from './pages/Automations';
import CreateAutomation from './pages/CreateAutomation';
import Activity from './pages/Activity';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { Cpu } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050918', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(37,99,235,0.4)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <Cpu size={28} color="white" />
          </div>
          <p style={{ color: '#334155', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading SmartFlow AI...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard"         element={<Dashboard />} />
        <Route path="automations"       element={<Automations />} />
        <Route path="create-automation" element={<CreateAutomation />} />
        <Route path="activity"          element={<Activity />} />
        <Route path="alerts"            element={<Alerts />} />
        <Route path="analytics"         element={<Analytics />} />
        <Route path="settings"          element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d1835',
              color: '#e2e8f0',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: '14px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0d1835' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1835' } },
            loading: { iconTheme: { primary: '#3b82f6', secondary: '#0d1835' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
