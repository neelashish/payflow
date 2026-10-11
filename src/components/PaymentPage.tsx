import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrganisation, getFeeCategoriesByOrganisation, createPaymentRequest, updatePaymentRequest, simulateCreateRazorpayOrder, createPayment, createReceipt, addCustomer } from '../store';
import type { Organisation, FeeCategory } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('org');
  
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [form, setForm] = useState({
    customerName: '',
    customerReferenceId: '',
    customerEmail: '',
    customerPhone: '',
    feeCategoryId: '',
    customAmount: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (orgId) {
      const org = getOrganisation(orgId);
      setOrganisation(org);
      if (org) {
        setFeeCategories(getFeeCategoriesByOrganisation(orgId).filter(f => f.isActive));
      }
    }
  }, [orgId]);

  if (!orgId || !organisation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <i className="fas fa-exclamation-triangle text-4xl text-amber-400 mb-4"></i>
            <h2 className="text-xl font-bold text-white mb-2">Invalid Payment Link</h2>
            <p className="text-slate-400 mb-6">This payment link is invalid or the organisation is not found.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.customerEmail.trim()) errs.customerEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = 'Invalid email';
    if (!form.customerPhone.trim()) errs.customerPhone = 'Mobile number is required';
    if (!form.feeCategoryId) errs.feeCategoryId = 'Please select a fee category';
    if (form.feeCategoryId === 'custom' && (!form.customAmount || parseFloat(form.customAmount) <= 0)) {
      errs.customAmount = 'Please enter a valid amount';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getAmount = (): number => {
    if (form.feeCategoryId === 'custom') {
      return parseFloat(form.customAmount) || 0;
    }
    const fee = feeCategories.find(f => f.id === form.feeCategoryId);
    return fee?.defaultAmount || 0;
  };

  const handleProceed = () => {
    if (validate()) {
      setShowSummary(true);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const amount = getAmount();
      const amountPaise = Math.round(amount * 100);
      
      // Create or find customer
      const customer = addCustomer(organisation.id, {
        customerId: form.customerReferenceId || `CUST-${Date.now()}`,
        name: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        address: '',
        referenceType: 'customer',
        referenceId: form.customerReferenceId,
        additionalInfo: '',
      });

      const fee = feeCategories.find(f => f.id === form.feeCategoryId);
      const feeDescription = form.feeCategoryId === 'custom' ? `Custom Payment - ₹${form.customAmount}` : fee?.name || 'Payment';

      // Create payment request
      const paymentRequest = createPaymentRequest(organisation.id, {
        customerId: customer.id,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        customerReferenceId: form.customerReferenceId,
        feeCategoryId: form.feeCategoryId,
        feeDescription,
        amountPaise,
        currency: organisation.currency,
        description: form.description || feeDescription,
        dueDate: null,
      });

      // Create Razorpay order (simulated)
      const orderId = simulateCreateRazorpayOrder(amountPaise, organisation.currency, paymentRequest.id);
      updatePaymentRequest(paymentRequest.id, { razorpayOrderId: orderId });

      // Simulate payment (in production, this would open Razorpay Checkout)
      await simulatePaymentFlow(paymentRequest, orderId, amountPaise);
    } catch (error) {
      console.error('Payment error:', error);
      setProcessing(false);
      alert('An error occurred. Please try again.');
    }
  };

  const simulatePaymentFlow = async (paymentRequest: any, orderId: string, amountPaise: number) => {
    // Demo mode - simulate successful payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signature = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    
    await verifyAndProcess(paymentRequest, orderId, paymentId, signature, orderId, amountPaise);
  };

  const verifyAndProcess = async (
    paymentRequest: any,
    orderId: string,
    paymentId: string,
    signature: string,
    razorpayOrderId: string,
    amountPaise: number
  ) => {
    try {
      // Simulate server-side verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!signature || signature.length < 10) {
        updatePaymentRequest(paymentRequest.id, { status: 'failed' });
        navigate(`/payment/failed?pr=${paymentRequest.id}&reason=Payment verification failed`);
        return;
      }

      // Create payment record
      const payment = createPayment(organisation.id, {
        paymentRequestId: paymentRequest.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentMethod: 'Online (Razorpay)',
        amountPaise,
        currency: organisation.currency,
        status: 'captured',
      });

      // Update payment request status
      updatePaymentRequest(paymentRequest.id, { status: 'captured', razorpayOrderId: orderId });

      // Generate receipt
      const receipt = createReceipt(organisation.id, {
        paymentId: payment.id,
        paymentRequestId: paymentRequest.id,
        customerId: paymentRequest.customerId,
        customerName: paymentRequest.customerName,
        customerReferenceId: paymentRequest.customerReferenceId,
        customerEmail: paymentRequest.customerEmail,
        amount: amountPaise / 100,
        currency: organisation.currency,
        feeDescription: paymentRequest.feeDescription,
        paymentMethod: payment.paymentMethod,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
      });

      // Navigate to success page
      navigate(`/payment/success?receipt=${receipt.id}&pr=${paymentRequest.id}&org=${organisation.id}`);
    } catch (error) {
      console.error('Verification error:', error);
      setProcessing(false);
      navigate(`/payment/failed?pr=${paymentRequest.id}&reason=Verification error`);
    }
  };

  const amount = getAmount();

  if (showSummary) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Payment Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-medium">{form.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Reference ID</span>
                <span className="text-white font-medium">{form.customerReferenceId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Description</span>
                <span className="text-white font-medium">{form.feeCategoryId === 'custom' ? 'Custom Payment' : feeCategories.find(f => f.id === form.feeCategoryId)?.name}</span>
              </div>
              <div className="flex justify-between py-3 bg-blue-900/30 rounded-lg px-3">
                <span className="text-blue-300 font-bold text-lg">Amount Payable</span>
                <span className="text-white font-bold text-lg">₹{amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
                disabled={processing}
              >
                ← Back
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 border border-blue-700 mb-4 overflow-hidden">
            {organisation.logo ? (
              <img src={organisation.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-building text-2xl text-blue-400"></i>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{organisation.name}</h1>
          <p className="text-slate-400 text-sm">Online Payment Portal</p>
        </div>

        {/* Payment Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Payment Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name *</label>
              <input
                type="text"
                value={form.customerName}
                onChange={e => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.customerName ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                placeholder="Your name"
              />
              {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Reference ID / Customer ID</label>
              <input
                type="text"
                value={form.customerReferenceId}
                onChange={e => setForm(prev => ({ ...prev, customerReferenceId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={e => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.customerEmail ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                placeholder="email@example.com"
              />
              {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Mobile Number *</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={e => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.customerPhone ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                placeholder="+91 9876543210"
              />
              {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Payment For *</label>
              <select
                value={form.feeCategoryId}
                onChange={e => setForm(prev => ({ ...prev, feeCategoryId: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.feeCategoryId ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
              >
                <option value="">Select payment type</option>
                {feeCategories.map(fee => (
                  <option key={fee.id} value={fee.id}>
                    {fee.name} - ₹{fee.defaultAmount.toLocaleString('en-IN')}
                  </option>
                ))}
                <option value="custom">Custom Amount</option>
              </select>
              {errors.feeCategoryId && <p className="text-red-400 text-xs mt-1">{errors.feeCategoryId}</p>}
            </div>

            {form.feeCategoryId === 'custom' && (
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={form.customAmount}
                  onChange={e => setForm(prev => ({ ...prev, customAmount: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.customAmount ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none`}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
                {errors.customAmount && <p className="text-red-400 text-xs mt-1">{errors.customAmount}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Additional details"
              />
            </div>
          </div>

          {amount > 0 && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">Amount Payable:</span>
                <span className="text-2xl font-bold text-white">₹{amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleProceed}
            className="w-full mt-6 py-3.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition"
          >
            Proceed to Payment
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Secured by Razorpay | {organisation.name}</p>
        </div>
      </div>
    </div>
  );
}
