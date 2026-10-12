import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, User } from 'lucide-react';
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
    if (step === 1 && validateStep1()) setStep(2);
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
    <div className="min-h-screen bg-zinc-50 py-8 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to PayFlow
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">Create your organisation</h1>
          <p className="text-zinc-600">Set up your workspace in just a few minutes.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
            <span>1</span>
            <span className="hidden sm:inline">Organisation</span>
          </div>
          <div className={`w-8 h-px ${step >= 2 ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
            <span>2</span>
            <span className="hidden sm:inline">Admin Account</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Organisation Details</h2>
                <p className="text-sm text-zinc-500">Tell us about your organisation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={`input ${errors.name ? 'border-red-300' : ''}`} placeholder="e.g., ABC International School" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation Type *</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as OrganisationType }))} className="input">
                  {orgTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={`input ${errors.email ? 'border-red-300' : ''}`} placeholder="org@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={`input ${errors.phone ? 'border-red-300' : ''}`} placeholder="+91 9876543210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Address *</label>
                <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className={`input resize-none ${errors.address ? 'border-red-300' : ''}`} placeholder="Full address" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">City *</label>
                  <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={`input ${errors.city ? 'border-red-300' : ''}`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">State *</label>
                  <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={`input ${errors.state ? 'border-red-300' : ''}`} />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">PIN Code</label>
                  <input type="text" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} className="input" placeholder="560001" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Website (Optional)</label>
                <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="input" placeholder="https://www.example.com" />
              </div>

              <button onClick={handleNext} className="btn-primary w-full py-3 mt-2">
                Next: Admin Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Administrator Account</h2>
                <p className="text-sm text-zinc-500">Create your admin login</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Your Name *</label>
                <input type="text" value={form.adminName} onChange={e => setForm(p => ({ ...p, adminName: e.target.value }))} className={`input ${errors.adminName ? 'border-red-300' : ''}`} placeholder="Full name" />
                {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Your Email *</label>
                <input type="email" value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))} className={`input ${errors.adminEmail ? 'border-red-300' : ''}`} placeholder="admin@example.com" />
                {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password *</label>
                <input type="password" value={form.adminPassword} onChange={e => setForm(p => ({ ...p, adminPassword: e.target.value }))} className={`input ${errors.adminPassword ? 'border-red-300' : ''}`} placeholder="At least 6 characters" />
                {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} className={`input ${errors.confirmPassword ? 'border-red-300' : ''}`} placeholder="Re-enter password" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button onClick={handleRegister} className="btn-primary flex-1">
                  Create Organisation
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
