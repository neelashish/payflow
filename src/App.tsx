import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import OrgDashboard from './components/OrgDashboard';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import DemoPage from './components/DemoPage';
import DownloadPage from './components/DownloadPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<OrgDashboard />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailure />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
