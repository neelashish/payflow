import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrganisation, getFeeCategoriesByOrganisation, createPaymentRequest, updatePaymentRequest, simulateCreateRazorpayOrder, createPayment, createReceipt, addCustomer } from '../store';
import type { Organisation, FeeCategory } from '../types';
import { AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl border border-zinc-200 p-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Invalid Payment Link</h2>
            <p className="text-zinc-600 mb-6">This payment link is invalid or the organisation is not found.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 text-center">Payment Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Name</span>
                <span className="text-zinc-900 font-medium">{form.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Reference ID</span>
                <span className="text-zinc-900 font-medium">{form.customerReferenceId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500">Description</span>
                <span className="text-zinc-900 font-medium">{form.feeCategoryId === 'custom' ? 'Custom Payment' : feeCategories.find(f => f.id === form.feeCategoryId)?.name}</span>
              </div>
              <div className="flex justify-between py-3 bg-indigo-50 rounded-lg px-3 border border-indigo-100">
                <span className="text-indigo-700 font-bold text-lg">Amount Payable</span>
                <span className="text-zinc-900 font-bold text-lg">₹{amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="btn-secondary flex-1"
                disabled={processing}
              >
                ← Back
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="btn-primary flex-1"
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
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 mb-4 overflow-hidden">
            {organisation.logo ? (
              <img src={organisation.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-zinc-600">{organisation.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">{organisation.name}</h1>
          <p className="text-zinc-500 text-sm">Online Payment Portal</p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">Payment Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.customerName}
                onChange={e => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                className={`input ${errors.customerName ? 'border-red-300' : ''}`}
                placeholder="Your name"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Reference ID / Customer ID</label>
              <input
                type="text"
                value={form.customerReferenceId}
                onChange={e => setForm(prev => ({ ...prev, customerReferenceId: e.target.value }))}
                className="input"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={e => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                className={`input ${errors.customerEmail ? 'border-red-300' : ''}`}
                placeholder="email@example.com"
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={e => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                className={`input ${errors.customerPhone ? 'border-red-300' : ''}`}
                placeholder="+91 9876543210"
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Payment For *</label>
              <select
                value={form.feeCategoryId}
                onChange={e => setForm(prev => ({ ...prev, feeCategoryId: e.target.value }))}
                className={`input ${errors.feeCategoryId ? 'border-red-300' : ''}`}
              >
                <option value="">Select payment type</option>
                {feeCategories.map(fee => (
                  <option key={fee.id} value={fee.id}>
                    {fee.name} - ₹{fee.defaultAmount.toLocaleString('en-IN')}
                  </option>
                ))}
                <option value="custom">Custom Amount</option>
              </select>
              {errors.feeCategoryId && <p className="text-red-500 text-xs mt-1">{errors.feeCategoryId}</p>}
            </div>

            {form.feeCategoryId === 'custom' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={form.customAmount}
                  onChange={e => setForm(prev => ({ ...prev, customAmount: e.target.value }))}
                  className={`input ${errors.customAmount ? 'border-red-300' : ''}`}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
                {errors.customAmount && <p className="text-red-500 text-xs mt-1">{errors.customAmount}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description (Optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="input resize-none"
                placeholder="Additional details"
              />
            </div>
          </div>

          {amount > 0 && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Amount Payable:</span>
                <span className="text-2xl font-bold text-zinc-900">₹{amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleProceed}
            className="btn-primary w-full mt-6 py-3.5 px-6 text-base"
          >
            Proceed to Payment
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-zinc-500">
          <p>Secured by Razorpay | {organisation.name}</p>
        </div>
      </div>
    </div>
  );
}
