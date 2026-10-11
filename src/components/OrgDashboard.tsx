import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentOrganisation, getCurrentUser, 
  getPaymentRequestsByOrganisation, getPaymentsByOrganisation, 
  getReceiptsByOrganisation, getFeeCategoriesByOrganisation,
  getCustomersByOrganisation, updateOrganisation,
  addFeeCategory, importCustomers
} from '../store';
import type { Organisation, User, PaymentRequest, Payment, Receipt, FeeCategory, Customer } from '../types';
import { formatAmount, formatDate } from '../utils/format';
import ReceiptView from './ReceiptView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Menu, X, LogOut } from 'lucide-react';

type Tab = 'overview' | 'payments' | 'receipts' | 'fees' | 'customers' | 'import' | 'settings' | 'gateway';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const org = getCurrentOrganisation();
    const usr = getCurrentUser();
    if (!org || !usr) {
      navigate('/login');
      return;
    }
    setOrganisation(org);
    setUser(usr);
    refreshData(org.id);
  }, [navigate]);

  const refreshData = (orgId: string) => {
    setPaymentRequests(getPaymentRequestsByOrganisation(orgId));
    setPayments(getPaymentsByOrganisation(orgId));
    setReceipts(getReceiptsByOrganisation(orgId));
    setFeeCategories(getFeeCategoriesByOrganisation(orgId));
    setCustomers(getCustomersByOrganisation(orgId));
  };

  if (!organisation || !user) return null;

  const totalCollected = payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + p.amountPaise, 0);
  const successfulPayments = payments.filter(p => p.status === 'captured').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    navigate('/');
  };

  const viewReceipt = (receiptId: string) => {
    const r = receipts.find(rc => rc.id === receiptId);
    if (r) {
      setSelectedReceipt(r);
      setShowReceiptModal(true);
    }
  };

  const downloadReceiptPdf = async () => {
    if (!receiptRef.current || !selectedReceipt) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff', width: 794, windowWidth: 794 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = pdfWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, canvas.height * ratio);
      pdf.save(`Receipt_${selectedReceipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'payments', label: 'Payments', icon: 'fa-exchange-alt' },
    { id: 'receipts', label: 'Receipts', icon: 'fa-file-invoice' },
    { id: 'fees', label: 'Fee Categories', icon: 'fa-tags' },
    { id: 'customers', label: 'Customers', icon: 'fa-users' },
    { id: 'import', label: 'Import', icon: 'fa-file-import' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
    { id: 'gateway', label: 'Payment Gateway', icon: 'fa-credit-card' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
              {organisation.logo ? (
                <img src={organisation.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{organisation.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-zinc-900 truncate">{organisation.name}</h2>
              <p className="text-xs text-zinc-500 truncate">{user.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                activeTab === tab.id 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <i className={`fas ${tab.icon} w-4 text-center`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-zinc-600 hover:text-zinc-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-zinc-900 truncate">{tabs.find(t => t.id === activeTab)?.label}</h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard label="Total Collected" value={formatAmount(totalCollected / 100)} icon="fa-rupee-sign" color="green" />
                <StatCard label="Successful Payments" value={successfulPayments.toString()} icon="fa-check-circle" color="blue" />
                <StatCard label="Pending" value={pendingPayments.toString()} icon="fa-clock" color="yellow" />
                <StatCard label="Failed" value={failedPayments.toString()} icon="fa-times-circle" color="red" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-zinc-900 mb-4">Your Payment Link</h3>
                  <div className="bg-zinc-50 rounded-lg p-3 mb-4 border border-zinc-200">
                    <p className="text-xs text-zinc-500 mb-1">Share this link with your customers:</p>
                    <code className="text-sm text-indigo-600 break-all font-mono">{window.location.origin}/#/pay?org={organisation.id}</code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/#/pay?org=${organisation.id}`);
                    }}
                    className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition mb-3"
                  >
                    <i className="fas fa-copy mr-2"></i>Copy Link
                  </button>
                  <h3 className="text-base font-semibold text-zinc-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab('fees')} className="block w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm text-center transition">
                      <i className="fas fa-plus mr-2"></i>Add Fee Category
                    </button>
                    <button onClick={() => setActiveTab('import')} className="block w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm text-center transition">
                      <i className="fas fa-file-import mr-2"></i>Import Customers
                    </button>
                    <button onClick={() => setActiveTab('settings')} className="block w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm text-center transition">
                      <i className="fas fa-cog mr-2"></i>Settings
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-zinc-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {payments.slice(-5).reverse().map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                        <div className="min-w-0">
                          <p className="text-zinc-900 text-sm truncate">{p.razorpayPaymentId.substring(0, 15)}...</p>
                          <p className="text-zinc-500 text-xs">{formatDate(p.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-zinc-900 font-medium text-sm">{formatAmount(p.amountPaise / 100)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'captured' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No transactions yet</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === 'payments' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">All Payments</h1>
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Description</th>
                      <th className="px-4 py-3 text-right text-slate-400 font-medium">Amount</th>
                      <th className="px-4 py-3 text-center text-slate-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.map(pr => (
                      <tr key={pr.id} className="border-t border-slate-700/50">
                        <td className="px-4 py-3 text-slate-300">{formatDate(pr.createdAt)}</td>
                        <td className="px-4 py-3 text-white">{pr.customerName}</td>
                        <td className="px-4 py-3 text-slate-300">{pr.feeDescription}</td>
                        <td className="px-4 py-3 text-right text-white font-medium">{formatAmount(pr.amountPaise / 100)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${pr.status === 'captured' ? 'bg-green-900/50 text-green-400' : pr.status === 'failed' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                            {pr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paymentRequests.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No payments yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Receipts */}
          {activeTab === 'receipts' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Issued Receipts</h1>
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Receipt No.</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                      <th className="px-4 py-3 text-right text-slate-400 font-medium">Amount</th>
                      <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(r => (
                      <tr key={r.id} className="border-t border-slate-700/50">
                        <td className="px-4 py-3 text-white font-medium">{r.receiptNumber}</td>
                        <td className="px-4 py-3 text-white">{r.customerName}</td>
                        <td className="px-4 py-3 text-slate-300">{formatDate(r.issuedAt)}</td>
                        <td className="px-4 py-3 text-right text-white font-medium">{formatAmount(r.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => viewReceipt(r.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                            <i className="fas fa-eye mr-1"></i>View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No receipts issued yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fee Categories */}
          {activeTab === 'fees' && (
            <FeeCategoriesManager orgId={organisation.id} categories={feeCategories} onRefresh={() => refreshData(organisation.id)} />
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Customers</h1>
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Reference ID</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} className="border-t border-slate-700/50">
                        <td className="px-4 py-3 text-white">{c.name}</td>
                        <td className="px-4 py-3 text-slate-300">{c.referenceId || c.customerId}</td>
                        <td className="px-4 py-3 text-slate-300">{c.email}</td>
                        <td className="px-4 py-3 text-slate-300">{c.phone}</td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No customers yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import */}
          {activeTab === 'import' && (
            <ImportManager orgId={organisation.id} onRefresh={() => refreshData(organisation.id)} />
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <SettingsManager org={organisation} onRefresh={() => refreshData(organisation.id)} />
          )}

          {/* Gateway */}
          {activeTab === 'gateway' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Payment Gateway Configuration</h1>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                {organisation.razorpayConfigured ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/50 border-2 border-green-700 mb-4">
                      <i className="fas fa-check text-3xl text-green-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Razorpay Connected</h3>
                    <p className="text-slate-400 mb-4">Your organisation is configured to accept payments via Razorpay.</p>
                    <p className="text-sm text-slate-500">Key ID: {organisation.razorpayKeyId ? `${organisation.razorpayKeyId.substring(0, 8)}...` : 'Not set'}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/50 border-2 border-amber-700 mb-4">
                      <i className="fas fa-exclamation-triangle text-3xl text-amber-400"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Payment Gateway Not Configured</h3>
                    <p className="text-slate-400 mb-4">
                      To accept real payments, configure your Razorpay account credentials.
                    </p>
                    <div className="bg-slate-900/50 rounded-lg p-4 text-left max-w-md mx-auto mb-4">
                      <p className="text-sm text-slate-300 mb-2">To configure:</p>
                      <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Sign up at razorpay.com</li>
                        <li>Complete KYC verification</li>
                        <li>Get your API keys from Dashboard → Settings → API Keys</li>
                        <li>Enter your Key ID below</li>
                      </ol>
                    </div>
                    <p className="text-xs text-amber-400">
                      <i className="fas fa-info-circle mr-1"></i>
                      Demo mode is active. Payments are simulated for testing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-medium">Receipt: {selectedReceipt.receiptNumber}</h3>
              <div className="flex gap-2">
                <button onClick={downloadReceiptPdf} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                  <i className="fas fa-download mr-1"></i>PDF
                </button>
                <button onClick={() => { setShowReceiptModal(false); setSelectedReceipt(null); }} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="flex justify-center">
                <div className="transform scale-[0.5] md:scale-[0.65] lg:scale-[0.75] origin-top">
                  <ReceiptView ref={receiptRef} receipt={selectedReceipt} organisation={organisation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const bgColors: Record<string, string> = {
    green: 'bg-emerald-50',
    blue: 'bg-blue-50',
    yellow: 'bg-amber-50',
    red: 'bg-red-50',
  };
  const iconColors: Record<string, string> = {
    green: 'text-emerald-600',
    blue: 'text-blue-600',
    yellow: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${bgColors[color]}`}>
          <i className={`fas ${icon} text-xs ${iconColors[color]}`}></i>
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

// Fee Categories Manager
function FeeCategoriesManager({ orgId, categories, onRefresh }: { orgId: string; categories: FeeCategory[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [newFee, setNewFee] = useState({ name: '', description: '', amount: '' });

  const handleAdd = () => {
    if (!newFee.name || !newFee.amount) return;
    addFeeCategory(orgId, {
      name: newFee.name,
      description: newFee.description,
      defaultAmount: parseFloat(newFee.amount),
      currency: 'INR',
      isActive: true,
    });
    setNewFee({ name: '', description: '', amount: '' });
    setShowForm(false);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Fee Categories</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
          <i className="fas fa-plus mr-2"></i>Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Category name" value={newFee.name} onChange={e => setNewFee(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            <input type="text" placeholder="Description" value={newFee.description} onChange={e => setNewFee(p => ({ ...p, description: e.target.value }))} className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            <input type="number" placeholder="Amount (₹)" value={newFee.amount} onChange={e => setNewFee(p => ({ ...p, amount: e.target.value }))} className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm"><i className="fas fa-check mr-1"></i>Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Description</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Amount</th>
              <th className="px-4 py-3 text-center text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(fee => (
              <tr key={fee.id} className="border-t border-slate-700/50">
                <td className="px-4 py-3 text-white">{fee.name}</td>
                <td className="px-4 py-3 text-slate-300">{fee.description}</td>
                <td className="px-4 py-3 text-right text-white font-medium">₹{fee.defaultAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${fee.isActive ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {fee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No fee categories yet. Add one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Import Manager
function ImportManager({ orgId, onRefresh }: { orgId: string; onRefresh: () => void }) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (results) => { setRows(results.data as any[]); setStep('preview'); },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        setRows(XLSX.utils.sheet_to_json(sheet));
        setStep('preview');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = () => {
    const validRows = rows.filter((r: any) => r.Name || r.name);
    const customers = validRows.map((r: any) => ({
      customerId: r['Student ID'] || r['ID'] || r['Customer ID'] || `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: r.Name || r.name || '',
      email: r.Email || r.email || '',
      phone: r.Phone || r.phone || r.Mobile || '',
      address: r.Address || r.address || '',
      referenceType: 'student',
      referenceId: r['Student ID'] || r['ID'] || '',
      additionalInfo: r.Course || r.course || '',
    }));
    if (customers.length > 0) {
      importCustomers(orgId, customers);
      setImported(customers.length);
    }
    setStep('done');
    onRefresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Import Customers</h1>
      
      {step === 'upload' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div
            onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) processFile(file); }}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition cursor-pointer"
          >
            <i className="fas fa-cloud-upload-alt text-4xl text-slate-500 mb-4"></i>
            <p className="text-white font-medium mb-2">Drop your file here or click to browse</p>
            <p className="text-slate-400 text-sm">Supports CSV, XLSX files</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
          </div>
          <div className="mt-4 text-xs text-slate-500">
            <p>Expected columns: Name, Student ID / Customer ID, Email, Phone, Course, Address</p>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-medium mb-4">{fileName} — {rows.length} rows</h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-slate-700 mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 sticky top-0">
                <tr>
                  {Object.keys(rows[0] || {}).map(key => (
                    <th key={key} className="px-3 py-2 text-left text-slate-300 whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-3 py-2 text-slate-300 whitespace-nowrap">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setStep('upload'); setRows([]); }} className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg">Cancel</button>
            <button onClick={handleImport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              Import {rows.length} Records
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">Import Complete</h3>
          <p className="text-slate-400 mb-6">{imported} customers imported</p>
          <button onClick={() => { setStep('upload'); setRows([]); setImported(0); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Import More</button>
        </div>
      )}
    </div>
  );
}

// Settings Manager
function SettingsManager({ org, onRefresh }: { org: Organisation; onRefresh: () => void }) {
  const [form, setForm] = useState(org);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState(org.logo);

  const handleSave = () => {
    updateOrganisation(org.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onRefresh();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setLogoPreview(result);
        setForm(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Organisation Settings</h1>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
          <i className="fas fa-save mr-2"></i>Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm mb-6 flex items-center gap-2">
          <i className="fas fa-check-circle"></i>Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-medium mb-4">Logo</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
              {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <i className="fas fa-image text-2xl text-slate-500"></i>}
            </div>
            <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer text-sm">
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
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Address</label>
              <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">GSTIN</label>
              <input type="text" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Website</label>
              <input type="text" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-medium mb-4">Receipt Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Receipt Prefix</label>
              <input type="text" value={form.receiptPrefix} onChange={e => setForm(p => ({ ...p, receiptPrefix: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Prepared By</label>
              <input type="text" value={form.preparedBy} onChange={e => setForm(p => ({ ...p, preparedBy: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Authorised Signatory</label>
              <input type="text" value={form.authorisedSignatory} onChange={e => setForm(p => ({ ...p, authorisedSignatory: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-slate-300 mb-1">Declaration</label>
            <textarea value={form.declaration} onChange={e => setForm(p => ({ ...p, declaration: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="mt-4">
            <label className="block text-sm text-slate-300 mb-1">Terms & Conditions</label>
            <textarea value={form.termsAndConditions} onChange={e => setForm(p => ({ ...p, termsAndConditions: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none" />
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-medium mb-4">Bank Details (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Bank Name</label>
              <input type="text" value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Account Number</label>
              <input type="text" value={form.bankAccount} onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">IFSC Code</label>
              <input type="text" value={form.bankIfsc} onChange={e => setForm(p => ({ ...p, bankIfsc: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Branch</label>
              <input type="text" value={form.bankBranch} onChange={e => setForm(p => ({ ...p, bankBranch: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
