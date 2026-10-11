import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, setCurrentOrganisation, setCurrentUser } from '../store';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = authenticateUser(email, password);
    if (user) {
      setCurrentOrganisation(user.organisationId);
      setCurrentUser(user.id);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-900/50 border border-blue-700 mb-3">
            <i className="fas fa-bolt text-xl text-blue-400"></i>
          </div>
          <h1 className="text-xl font-bold text-white">Sign In to PayFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Access your organisation dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="admin@example.com"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Your password"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          Don't have an account?{' '}
          <a href="#/register" className="text-blue-400 hover:text-blue-300">Register your organisation</a>
        </div>
      </div>
    </div>
  );
}
