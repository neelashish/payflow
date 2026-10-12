import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileText,
  Download,
  Check,
  X,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Home,
  Play,
} from 'lucide-react';
import {
  loadDemoState,
  resetDemoState,
  updateDemoPaymentRequest,
  generateDemoReceiptNumber,
  generateDemoPaymentId,
  getDemoStats,
} from '../store';
import type { DemoState } from '../store';
import { formatAmount, formatDate } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type DemoView = 'dashboard' | 'payment-select' | 'payment-details' | 'checkout' | 'success' | 'failure' | 'receipt';

export default function DemoPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<DemoView>('dashboard');
  const [demoState, setDemoState] = useState<DemoState>(loadDemoState());
  const [selectedRequest, setSelectedRequest] = useState<DemoState['paymentRequests'][0] | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Demo Customer',
    email: 'demo@example.com',
    phone: '+91 98765 00000',
    referenceId: 'NS-DEMO-100',
  });
  const [receiptData, setReceiptData] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const stats = getDemoStats();

  const refreshState = () => setDemoState(loadDemoState());

  const handleReset = () => {
    resetDemoState();
    setDemoState(loadDemoState());
    setView('dashboard');
    setSelectedRequest(null);
  };

  const handleSelectRequest = (pr: DemoState['paymentRequests'][0]) => {
    setSelectedRequest(pr);
    setView('payment-details');
  };

  const handleProceedToCheckout = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }
    setView('checkout');
  };

  const handleSimulatePayment = (result: 'success' | 'failure' | 'cancel') => {
    if (!selectedRequest) return;

    if (result === 'cancel') {
      updateDemoPaymentRequest(selectedRequest.id, { status: 'cancelled' });
      refreshState();
      setView('payment-select');
      return;
    }

    if (result === 'failure') {
      const paymentId = generateDemoPaymentId();
      updateDemoPaymentRequest(selectedRequest.id, {
        status: 'failed',
        paymentId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerReferenceId: customerInfo.referenceId,
      });
      refreshState();
      setView('failure');
      return;
    }

    // Success
    const paymentId = generateDemoPaymentId();
    const receiptNumber = generateDemoReceiptNumber();
    updateDemoPaymentRequest(selectedRequest.id, {
      status: 'paid',
      paymentId,
      receiptNumber,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerReferenceId: customerInfo.referenceId,
      paidAt: new Date().toISOString(),
    });
    refreshState();
    setReceiptData({
      ...selectedRequest,
      paymentId,
      receiptNumber,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerReferenceId: customerInfo.referenceId,
      paidAt: new Date().toISOString(),
    });
    setView('success');
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !receiptData) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = pdfWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, canvas.height * ratio);
      pdf.save(`Demo_Receipt_${receiptData.receiptNumber}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Demo Banner */}
      <div className="demo-banner sticky top-0 z-50 px-4 py-2.5 text-center text-sm font-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>DEMO MODE — No real payment will be processed. No money will be deducted.</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-[41px] z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to PayFlow</span>
              </button>
              <div className="w-px h-5 bg-zinc-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{demoState.organisation.name}</p>
                  <p className="text-xs text-zinc-500 hidden sm:block">Demo Organisation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="btn-secondary text-xs py-1.5 px-3"
                title="Reset demo data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">Dashboard</h1>
              <p className="text-zinc-600">Overview of your organisation's payment activity.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard label="Total Collected" value={`₹${stats.totalCollected.toLocaleString('en-IN')}`} icon="credit-card" color="emerald" />
              <StatCard label="Successful" value={stats.successfulCount.toString()} icon="check" color="blue" />
              <StatCard label="Pending" value={stats.pendingCount.toString()} icon="clock" color="amber" />
              <StatCard label="Failed" value={stats.failedCount.toString()} icon="x" color="red" />
            </div>

            {/* Quick Actions */}
            <div className="card mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Start a Demo Payment</h3>
                  <p className="text-sm text-zinc-600">Select a payment request and simulate the checkout experience.</p>
                </div>
                <button
                  onClick={() => setView('payment-select')}
                  className="btn-accent"
                >
                  <Play className="w-4 h-4" />
                  Try Payment Flow
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <h3 className="text-base font-semibold text-zinc-900 mb-4">All Transactions</h3>
              <div className="overflow-x-auto -mx-6 sm:-mx-6">
                <div className="min-w-[600px] px-6 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="text-left py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</th>
                        <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                        <th className="text-center py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="text-center py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {demoState.paymentRequests
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((pr) => (
                        <tr key={pr.id} className="hover:bg-zinc-50/50">
                          <td className="py-3">
                            <p className="font-medium text-zinc-900">{pr.customerName || '—'}</p>
                            <p className="text-xs text-zinc-500">{pr.customerReferenceId || ''}</p>
                          </td>
                          <td className="py-3 text-zinc-600">{pr.title}</td>
                          <td className="py-3 text-right font-medium text-zinc-900">₹{pr.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3 text-center">
                            <StatusBadge status={pr.status} />
                          </td>
                          <td className="py-3 text-center">
                            {pr.receiptNumber ? (
                              <span className="text-xs text-zinc-500 font-mono">{pr.receiptNumber}</span>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Select View */}
        {view === 'payment-select' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">Select Payment Request</h1>
              <p className="text-zinc-600">Choose a payment to simulate the checkout experience.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoState.paymentRequests
                .filter(pr => pr.status === 'pending')
                .map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => handleSelectRequest(pr)}
                  className="card card-hover text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="badge badge-neutral">Pending</span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">{pr.title}</h3>
                  <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{pr.description}</p>
                  <p className="text-xl font-bold text-zinc-900">₹{pr.amount.toLocaleString('en-IN')}</p>
                </button>
              ))}
            </div>

            {demoState.paymentRequests.filter(pr => pr.status === 'pending').length === 0 && (
              <div className="card text-center py-12">
                <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-600 mb-4">All payment requests have been processed.</p>
                <button onClick={handleReset} className="btn-secondary">
                  <RotateCcw className="w-4 h-4" />
                  Reset Demo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Details View */}
        {view === 'payment-details' && selectedRequest && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <button
              onClick={() => setView('payment-select')}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="card">
              <h2 className="text-xl font-bold text-zinc-900 mb-1">{selectedRequest.title}</h2>
              <p className="text-zinc-600 mb-6">{selectedRequest.description}</p>

              <div className="bg-zinc-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">Amount Payable</span>
                  <span className="text-2xl font-bold text-zinc-900">₹{selectedRequest.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Customer Information</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo(p => ({ ...p, name: e.target.value }))}
                    className="input"
                    placeholder="Customer name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Email *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo(p => ({ ...p, email: e.target.value }))}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo(p => ({ ...p, phone: e.target.value }))}
                      className="input"
                      placeholder="+91 98765 00000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={customerInfo.referenceId}
                    onChange={e => setCustomerInfo(p => ({ ...p, referenceId: e.target.value }))}
                    className="input"
                    placeholder="Customer reference"
                  />
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn-primary w-full py-3"
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Checkout View */}
        {view === 'checkout' && selectedRequest && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <button
              onClick={() => setView('payment-details')}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="card">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-1">Simulate Payment</h2>
                <p className="text-sm text-zinc-600">Choose how this demo payment should resolve.</p>
              </div>

              <div className="bg-zinc-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Description</span>
                  <span className="font-medium text-zinc-900">{selectedRequest.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Customer</span>
                  <span className="font-medium text-zinc-900">{customerInfo.name}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-200 pt-2 mt-2">
                  <span className="text-zinc-900 font-medium">Total</span>
                  <span className="text-lg font-bold text-zinc-900">₹{selectedRequest.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleSimulatePayment('success')}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simulate Successful Payment
                </button>
                <button
                  onClick={() => handleSimulatePayment('failure')}
                  className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Simulate Failed Payment
                </button>
                <button
                  onClick={() => handleSimulatePayment('cancel')}
                  className="w-full py-3 px-4 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium transition flex items-center justify-center gap-2"
                >
                  Cancel Payment
                </button>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 text-center">
                  <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                  This is a simulation. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success View */}
        {view === 'success' && receiptData && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="card text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful</h2>
              <p className="text-3xl font-bold text-zinc-900 mb-4">₹{receiptData.amount.toLocaleString('en-IN')}</p>
              <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto mb-6">
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Customer</p>
                  <p className="text-sm font-medium text-zinc-900">{receiptData.customerName}</p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Receipt No.</p>
                  <p className="text-sm font-medium text-zinc-900 font-mono">{receiptData.receiptNumber}</p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Payment ID</p>
                  <p className="text-sm font-medium text-zinc-900 font-mono text-xs truncate">{receiptData.paymentId}</p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Date</p>
                  <p className="text-sm font-medium text-zinc-900">{formatDate(receiptData.paidAt)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="btn-primary flex-1"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt PDF
                </button>
                <button
                  onClick={() => { setView('receipt'); }}
                  className="btn-secondary flex-1"
                >
                  <FileText className="w-4 h-4" />
                  View Receipt
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setView('dashboard'); setSelectedRequest(null); }}
                className="btn-secondary flex-1"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => { setView('payment-select'); setSelectedRequest(null); }}
                className="btn-secondary flex-1"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        )}

        {/* Failure View */}
        {view === 'failure' && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Payment Failed</h2>
              <p className="text-zinc-600 mb-6">The simulated payment could not be completed.</p>
              <div className="bg-zinc-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-zinc-600 mb-2">What happened?</p>
                <ul className="text-sm text-zinc-600 space-y-1">
                  <li>• No amount was debited</li>
                  <li>• No receipt was generated</li>
                  <li>• You can retry or choose a different payment</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setView('payment-details'); }}
                  className="btn-primary"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => { setView('payment-select'); setSelectedRequest(null); }}
                  className="btn-secondary"
                >
                  Choose Different Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt View */}
        {view === 'receipt' && receiptData && (
          <div className="animate-fade-in">
            <button
              onClick={() => setView('success')}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button onClick={handleDownloadReceipt} className="btn-primary flex-1">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button onClick={() => setView('dashboard')} className="btn-secondary flex-1">
                <Home className="w-4 h-4" />
                Dashboard
              </button>
            </div>

            <div className="bg-white rounded-lg border border-zinc-200 p-4 overflow-x-auto">
              <div className="flex justify-center">
                <div className="transform scale-[0.45] sm:scale-[0.55] md:scale-[0.7] origin-top">
                  <DemoReceiptView ref={receiptRef} receipt={receiptData} organisation={demoState.organisation} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colors[color]}`}>
          {icon === 'credit-card' && <CreditCard className="w-3.5 h-3.5" />}
          {icon === 'check' && <Check className="w-3.5 h-3.5" />}
          {icon === 'clock' && <span className="text-xs">⏱</span>}
          {icon === 'x' && <X className="w-3.5 h-3.5" />}
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'badge-success',
    pending: 'badge-warning',
    failed: 'badge-error',
    cancelled: 'badge-neutral',
  };

  return (
    <span className={`badge ${styles[status] || 'badge-neutral'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Demo Receipt View
import { forwardRef } from 'react';
import { amountInWords } from '../utils/format';

const DemoReceiptView = forwardRef<HTMLDivElement, { receipt: any; organisation: DemoState['organisation'] }>(
  ({ receipt, organisation }, ref) => {
    return (
      <div ref={ref} style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Georgia, serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        {/* DEMO WATERMARK */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: '60pt',
          fontWeight: 'bold',
          color: 'rgba(239, 68, 68, 0.15)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}>
          DEMO RECEIPT
        </div>

        {/* Border */}
        <div style={{
          position: 'absolute',
          top: '8mm',
          left: '8mm',
          right: '8mm',
          bottom: '8mm',
          border: '2px solid #1a1a1a',
          pointerEvents: 'none',
        }} />

        <div style={{ padding: '5mm', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                {organisation.name.charAt(0)}
              </div>
              <div>
                <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a365d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {organisation.name}
                </h1>
                <p style={{ margin: '0', fontSize: '9pt', color: '#555' }}>
                  {organisation.address}, {organisation.city}, {organisation.state} - {organisation.pincode}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#555' }}>
                  Email: {organisation.email} | Phone: {organisation.phone}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '12px', backgroundColor: '#1a365d', color: '#fff', padding: '6px 20px', display: 'inline-block', borderRadius: '3px', fontSize: '13pt', fontWeight: 'bold', letterSpacing: '2px' }}>
              PAYMENT RECEIPT
            </div>
          </div>

          {/* DEMO NOTICE */}
          <div style={{ marginBottom: '15px', padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10pt', fontWeight: 'bold', color: '#dc2626' }}>
              ⚠ DEMO RECEIPT — NOT PROOF OF PAYMENT
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '8pt', color: '#991b1b' }}>
              This is a simulated receipt for demonstration purposes only. No real payment was processed.
            </p>
          </div>

          {/* Receipt Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '8px 12px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <div>
              <div style={{ fontSize: '9pt', color: '#666' }}>Receipt No.</div>
              <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{receipt.receiptNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '9pt', color: '#666' }}>Date</div>
              <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{formatDate(receipt.paidAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: '9pt', color: '#666' }}>Status</div>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', color: '#16a34a' }}>✓ PAID (DEMO)</div>
            </div>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: '15px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #dee2e6' }}>
              RECEIVED FROM
            </div>
            <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10pt' }}>
              <div><strong>Name:</strong> {receipt.customerName}</div>
              <div><strong>Reference ID:</strong> {receipt.customerReferenceId}</div>
              <div><strong>Email:</strong> {receipt.customerEmail}</div>
              <div><strong>Phone:</strong> {receipt.customerPhone}</div>
            </div>
          </div>

          {/* Particulars */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a365d', color: '#fff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #1a365d' }}>S.No.</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #1a365d' }}>Particulars</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #1a365d' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #dee2e6' }}>1</td>
                <td style={{ padding: '8px 12px', border: '1px solid #dee2e6' }}>{receipt.title}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right' }}>₹{receipt.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td colSpan={2} style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Total Amount</td>
                <td style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right', fontSize: '12pt', color: '#1a365d' }}>₹{receipt.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words */}
          <div style={{ marginBottom: '15px', padding: '8px 12px', backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '4px', fontSize: '10pt' }}>
            <strong>Amount in Words:</strong> {amountInWords(receipt.amount)}
          </div>

          {/* Payment Details */}
          <div style={{ marginBottom: '15px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #dee2e6' }}>
              PAYMENT DETAILS (DEMO)
            </div>
            <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9pt' }}>
              <div><strong>Payment Method:</strong> Simulated (Demo)</div>
              <div><strong>Payment ID:</strong> {receipt.paymentId}</div>
              <div><strong>Transaction Ref:</strong> DEMO-{receipt.paymentId?.slice(-8) || 'N/A'}</div>
              <div><strong>Payment Date:</strong> {formatDate(receipt.paidAt)}</div>
            </div>
          </div>

          {/* Bank Details */}
          <div style={{ marginBottom: '15px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #dee2e6' }}>
              BANK DETAILS
            </div>
            <div style={{ padding: '10px 12px', fontSize: '9pt' }}>
              <div><strong>Bank:</strong> {organisation.bankName}</div>
              <div><strong>Account No:</strong> {organisation.bankAccount}</div>
              <div><strong>IFSC:</strong> {organisation.bankIfsc}</div>
              <div><strong>Branch:</strong> {organisation.bankBranch}</div>
            </div>
          </div>

          {/* Declaration */}
          <div style={{ marginBottom: '15px', padding: '8px 12px', fontStyle: 'italic', fontSize: '9pt', color: '#555', borderLeft: '3px solid #1a365d' }}>
            {organisation.declaration}
          </div>

          {/* Terms */}
          <div style={{ marginBottom: '20px', fontSize: '8pt', color: '#666' }}>
            <strong>Terms & Conditions:</strong>
            <div style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>{organisation.termsAndConditions}</div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', width: '150px', paddingTop: '8px', fontSize: '9pt' }}>
                {organisation.preparedBy}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', width: '150px', paddingTop: '8px', fontSize: '9pt' }}>
                {organisation.authorisedSignatory}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DemoReceiptView.displayName = 'DemoReceiptView';
