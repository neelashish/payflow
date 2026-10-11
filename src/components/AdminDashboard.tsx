import { useState, useEffect, useRef } from 'react';
import { getAllPaymentRequests, getAllPayments, getAllReceipts, getOrganisation, getReceipt, getFeeItems, addFeeItem } from '../store';
import type { PaymentRequest, Payment, Receipt, Organisation } from '../types';
import { formatAmount, formatDate } from '../utils/format';
import ReceiptView from './ReceiptView';
import BusinessProfile from './BusinessProfile';
import StudentImport from './StudentImport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Tab = 'transactions' | 'receipts' | 'profile' | 'import' | 'fees';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [organisation, setOrganisation] = useState<Organisation>(getOrganisation());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPaymentRequests(getAllPaymentRequests());
    setPayments(getAllPayments());
    setReceipts(getAllReceipts());
    setOrganisation(getOrganisation());
  };

  const filteredRequests = paymentRequests.filter(pr => {
    const matchesSearch = !searchTerm || 
      pr.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.studentAdmissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    const matchesDate = !dateFilter || pr.createdAt.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
      created: 'bg-blue-900/50 text-blue-400 border-blue-700',
      authorised: 'bg-purple-900/50 text-purple-400 border-purple-700',
      captured: 'bg-green-900/50 text-green-400 border-green-700',
      failed: 'bg-red-900/50 text-red-400 border-red-700',
      cancelled: 'bg-slate-700/50 text-slate-400 border-slate-600',
      refunded: 'bg-orange-900/50 text-orange-400 border-orange-700',
    };
    return styles[status] || 'bg-slate-700/50 text-slate-400 border-slate-600';
  };

  const viewReceipt = (receiptId: string) => {
    const r = getReceipt(receiptId);
    if (r) {
      setSelectedReceipt(r);
      setShowReceiptModal(true);
    }
  };

  const downloadReceiptPdf = async () => {
    if (!receiptRef.current || !selectedReceipt) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth * ratio) / 2, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Receipt_${selectedReceipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  const exportCsv = () => {
    const headers = ['Date', 'Student Name', 'Student ID', 'Course', 'Fee Description', 'Amount', 'Status', 'Receipt No.', 'Payment ID'];
    const rows = filteredRequests.map(pr => {
      const receipt = receipts.find(r => r.paymentRequestId === pr.id);
      const payment = payments.find(p => p.paymentRequestId === pr.id);
      return [
        formatDate(pr.createdAt),
        pr.studentName,
        pr.studentAdmissionId,
        pr.course,
        pr.feeDescription,
        (pr.amountPaise / 100).toFixed(2),
        pr.status,
        receipt?.receiptNumber || '',
        payment?.razorpayPaymentId || '',
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCollected = payments.filter(p => p.status === 'captured').reduce((sum, p) => sum + p.amountPaise, 0);
  const totalTransactions = payments.length;
  const successfulTransactions = payments.filter(p => p.status === 'captured').length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'transactions', label: 'Transactions', icon: 'fa-exchange-alt' },
    { id: 'receipts', label: 'Receipts', icon: 'fa-file-invoice' },
    { id: 'fees', label: 'Fee Items', icon: 'fa-rupee-sign' },
    { id: 'import', label: 'Import', icon: 'fa-file-import' },
    { id: 'profile', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-blue-400"></i>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 text-xs rounded border border-amber-700">TEST MODE</span>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); window.location.hash = '#/'; }}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            <i className="fas fa-sign-out-alt mr-1"></i>Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-slate-400 text-xs mb-1">Total Collected</div>
            <div className="text-xl font-bold text-green-400">{formatAmount(totalCollected / 100)}</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-slate-400 text-xs mb-1">Transactions</div>
            <div className="text-xl font-bold text-white">{totalTransactions}</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-slate-400 text-xs mb-1">Successful</div>
            <div className="text-xl font-bold text-blue-400">{successfulTransactions}</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-slate-400 text-xs mb-1">Receipts Issued</div>
            <div className="text-xl font-bold text-purple-400">{receipts.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="captured">Captured</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
              />
              <button
                onClick={exportCsv}
                className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
              >
                <i className="fas fa-download mr-1"></i>Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Date</th>
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Student</th>
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Fee</th>
                    <th className="px-3 py-3 text-right text-slate-400 font-medium">Amount</th>
                    <th className="px-3 py-3 text-center text-slate-400 font-medium">Status</th>
                    <th className="px-3 py-3 text-center text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(pr => {
                      const receipt = receipts.find(r => r.paymentRequestId === pr.id);
                      return (
                        <tr key={pr.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="px-3 py-3 text-slate-300">{formatDate(pr.createdAt)}</td>
                          <td className="px-3 py-3">
                            <div className="text-white">{pr.studentName}</div>
                            <div className="text-slate-500 text-xs">{pr.studentAdmissionId}</div>
                          </td>
                          <td className="px-3 py-3 text-slate-300">{pr.feeDescription}</td>
                          <td className="px-3 py-3 text-right text-white font-medium">{formatAmount(pr.amountPaise / 100)}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(pr.status)}`}>
                              {pr.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {receipt && (
                              <button
                                onClick={() => viewReceipt(receipt.id)}
                                className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs transition"
                              >
                                <i className="fas fa-eye mr-1"></i>Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-medium mb-4">Issued Receipts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Receipt No.</th>
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Student</th>
                    <th className="px-3 py-3 text-left text-slate-400 font-medium">Date</th>
                    <th className="px-3 py-3 text-right text-slate-400 font-medium">Amount</th>
                    <th className="px-3 py-3 text-center text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">No receipts issued yet</td>
                    </tr>
                  ) : (
                    receipts.map(r => (
                      <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="px-3 py-3 text-white font-medium">{r.receiptNumber}</td>
                        <td className="px-3 py-3">
                          <div className="text-white">{r.studentName}</div>
                          <div className="text-slate-500 text-xs">{r.studentAdmissionId}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{formatDate(r.issuedAt)}</td>
                        <td className="px-3 py-3 text-right text-white font-medium">{formatAmount(r.amount)}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => viewReceipt(r.id)}
                            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs transition mr-1"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fee Items Tab */}
        {activeTab === 'fees' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <FeeItemsManager onRefresh={refreshData} />
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <StudentImport />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <BusinessProfile />
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-medium">
                Receipt: {selectedReceipt.receiptNumber}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadReceiptPdf}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                >
                  <i className="fas fa-download mr-1"></i>PDF
                </button>
                <button
                  onClick={() => { setShowReceiptModal(false); setSelectedReceipt(null); }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
                >
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

// Fee Items Manager sub-component
function FeeItemsManager({ onRefresh }: { onRefresh: () => void }) {
  const [feeItems, setFeeItems] = useState(getFeeItems());
  const [showForm, setShowForm] = useState(false);
  const [newFee, setNewFee] = useState({ description: '', amount: '', academicSession: '2026-27' });

  const handleAdd = () => {
    if (!newFee.description || !newFee.amount) return;
    addFeeItem({
      description: newFee.description,
      amount: parseFloat(newFee.amount),
      currency: 'INR',
      academicSession: newFee.academicSession,
      active: true,
    });
    setFeeItems(getFeeItems());
    setNewFee({ description: '', amount: '', academicSession: '2026-27' });
    setShowForm(false);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Fee Items</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          <i className="fas fa-plus mr-1"></i>Add Fee
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Fee description"
              value={newFee.description}
              onChange={e => setNewFee(prev => ({ ...prev, description: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={newFee.amount}
              onChange={e => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
            >
              <i className="fas fa-check mr-1"></i>Save
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-3 py-3 text-left text-slate-400 font-medium">Description</th>
              <th className="px-3 py-3 text-right text-slate-400 font-medium">Amount</th>
              <th className="px-3 py-3 text-left text-slate-400 font-medium">Session</th>
              <th className="px-3 py-3 text-center text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {feeItems.map((fee) => (
              <tr key={fee.id} className="border-b border-slate-700/50">
                <td className="px-3 py-3 text-white">{fee.description}</td>
                <td className="px-3 py-3 text-right text-white font-medium">₹{fee.amount.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-slate-300">{fee.academicSession}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs border ${fee.active ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                    {fee.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
