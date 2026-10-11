import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { useState, useEffect } from 'react';

function AdminRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    setAuthenticated(auth === 'true');
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailure />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
