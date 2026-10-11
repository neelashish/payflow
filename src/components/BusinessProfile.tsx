import { useState } from 'react';
import { getOrganisation, updateOrganisation } from '../store';
import type { Organisation } from '../types';

export default function BusinessProfile() {
  const [org, setOrg] = useState<Organisation>(getOrganisation());
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(org.logo);

  const handleChange = (field: keyof Organisation, value: string) => {
    setOrg(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setLogoPreview(result);
        handleChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateOrganisation(org);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-building text-blue-400"></i>
          Business Profile
        </h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
        >
          <i className="fas fa-save"></i>
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
          <i className="fas fa-check-circle"></i>
          Profile saved successfully!
        </div>
      )}

      {/* Logo */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-medium mb-4">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <i className="fas fa-image text-2xl text-slate-500"></i>
            )}
          </div>
          <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition text-sm">
            <i className="fas fa-upload mr-2"></i>Upload Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Organisation Details */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-medium mb-4">Organisation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">Organisation Name</label>
            <input
              type="text"
              value={org.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">Address</label>
            <textarea
              value={org.address}
              onChange={e => handleChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={org.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone</label>
            <input
              type="text"
              value={org.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">GSTIN</label>
            <input
              type="text"
              value={org.gstin}
              onChange={e => handleChange('gstin', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Receipt Number Prefix</label>
            <input
              type="text"
              value={org.receiptPrefix}
              onChange={e => handleChange('receiptPrefix', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g., WC"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-medium mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Bank Name</label>
            <input
              type="text"
              value={org.bankName}
              onChange={e => handleChange('bankName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Account Number</label>
            <input
              type="text"
              value={org.bankAccount}
              onChange={e => handleChange('bankAccount', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">IFSC Code</label>
            <input
              type="text"
              value={org.bankIfsc}
              onChange={e => handleChange('bankIfsc', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Branch</label>
            <input
              type="text"
              value={org.bankBranch}
              onChange={e => handleChange('bankBranch', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-medium mb-4">Receipt Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Declaration</label>
            <textarea
              value={org.declaration}
              onChange={e => handleChange('declaration', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Terms & Conditions</label>
            <textarea
              value={org.termsAndConditions}
              onChange={e => handleChange('termsAndConditions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Prepared By</label>
              <input
                type="text"
                value={org.preparedBy}
                onChange={e => handleChange('preparedBy', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Authorised Signatory</label>
              <input
                type="text"
                value={org.authorisedSignatory}
                onChange={e => handleChange('authorisedSignatory', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
