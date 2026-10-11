import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerOrganisation, setCurrentOrganisation, setCurrentUser } from '../store';
import type { OrganisationType } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    type: 'school' as OrganisationType,
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Organisation name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.adminName.trim()) errs.adminName = 'Admin name is required';
    if (!form.adminEmail.trim()) errs.adminEmail = 'Admin email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) errs.adminEmail = 'Invalid email';
    if (!form.adminPassword) errs.adminPassword = 'Password is required';
    else if (form.adminPassword.length < 6) errs.adminPassword = 'Password must be at least 6 characters';
    if (form.adminPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = () => {
    if (validateStep2()) {
      const { organisation, user } = registerOrganisation(form);
      setCurrentOrganisation(organisation.id);
      setCurrentUser(user.id);
      navigate('/dashboard');
    }
  };

  const orgTypes: { value: OrganisationType; label: string }[] = [
    { value: 'school', label: 'School' },
    { value: 'college_university', label: 'College or University' },
    { value: 'coaching_institute', label: 'Coaching or Training Institute' },
    { value: 'ngo_charity', label: 'NGO or Charitable Organisation' },
    { value: 'club_association', label: 'Club or Association' },
    { value: 'healthcare', label: 'Healthcare Provider' },
    { value: 'business_service', label: 'Business or Service Provider' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Organisation</h1>
          <p className="text-slate-400">Set up your workspace in minutes</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-700'} text-white font-bold`}>1</div>
          <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'} text-white font-bold`}>2</div>
        </div>

        {step === 1 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Organisation Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Organisation Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="e.g., ABC International School"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Organisation Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value as OrganisationType }))}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {orgTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                    placeholder="org@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Address *</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.address ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none`}
                  placeholder="Full address"
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.city ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.state ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  />
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={e => setForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="560001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Website (Optional)</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://www.example.com"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
              >
                Next: Admin Account →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Administrator Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={e => setForm(prev => ({ ...prev, adminName: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.adminName ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="Full name"
                />
                {errors.adminName && <p className="text-red-400 text-xs mt-1">{errors.adminName}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Your Email *</label>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={e => setForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.adminEmail ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="admin@example.com"
                />
                {errors.adminEmail && <p className="text-red-400 text-xs mt-1">{errors.adminEmail}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  value={form.adminPassword}
                  onChange={e => setForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.adminPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="At least 6 characters"
                />
                {errors.adminPassword && <p className="text-red-400 text-xs mt-1">{errors.adminPassword}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleRegister}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                >
                  Create Organisation
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <a href="#/login" className="text-blue-400 hover:text-blue-300">Sign In</a>
        </div>
      </div>
    </div>
  );
}
