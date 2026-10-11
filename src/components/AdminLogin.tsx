import { useState } from 'react';
import { verifyAdminPassword } from '../store';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate network delay
    setTimeout(() => {
      if (verifyAdminPassword(password)) {
        sessionStorage.setItem('admin_auth', 'true');
        onLogin();
      } else {
        setError('Invalid password. Please try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-900/50 border border-blue-700 mb-3">
            <i className="fas fa-shield-alt text-xl text-blue-400"></i>
          </div>
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>

          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
            <p className="text-xs text-amber-300">
              <i className="fas fa-info-circle mr-1"></i>
              Demo password: <code className="bg-slate-800 px-1 rounded">admin123</code>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
