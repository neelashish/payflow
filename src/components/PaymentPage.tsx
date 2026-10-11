import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaymentRequest, updatePaymentRequest, simulateCreateRazorpayOrder, createPayment, createReceipt, getOrganisation, getFeeItems } from '../store';
import type { PaymentRequest } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const organisation = getOrganisation();
  const feeItems = getFeeItems().filter(f => f.active);
  
  const [form, setForm] = useState({
    studentName: '',
    studentId: '',
    course: '',
    academicSession: '2026-27',
    parentName: '',
    email: '',
    phone: '',
    feeDescription: '',
    customAmount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedFeeAmount, setSelectedFeeAmount] = useState<number>(0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.studentName.trim()) errs.studentName = 'Student name is required';
    if (!form.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!form.course.trim()) errs.course = 'Course/Class is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.phone.trim()) errs.phone = 'Mobile number is required';
    else if (!/^\+?[\d\s-]{10,15}$/.test(form.phone)) errs.phone = 'Invalid mobile number';
    if (!form.feeDescription) errs.feeDescription = 'Please select a fee type';
    if (form.feeDescription === 'custom' && (!form.customAmount || parseFloat(form.customAmount) <= 0)) {
      errs.customAmount = 'Please enter a valid amount';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFeeSelect = (desc: string) => {
    setForm(prev => ({ ...prev, feeDescription: desc }));
    const feeItem = feeItems.find(f => f.description === desc);
    if (feeItem) {
      setSelectedFeeAmount(feeItem.amount);
    } else {
      setSelectedFeeAmount(0);
    }
  };

  const getAmount = (): number => {
    if (form.feeDescription === 'custom') {
      return parseFloat(form.customAmount) || 0;
    }
    return selectedFeeAmount;
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
      
      // Step 1: Create payment request
      const paymentRequest = createPaymentRequest({
        studentId: form.studentId,
        studentName: form.studentName,
        studentAdmissionId: form.studentId,
        course: form.course,
        academicSession: form.academicSession,
        parentName: form.parentName,
        email: form.email,
        phone: form.phone,
        feeDescription: form.feeDescription === 'custom' ? `Custom Fee - ${form.customAmount}` : form.feeDescription,
        amountPaise,
        currency: 'INR',
      });

      // Step 2: Create Razorpay order (simulated)
      const orderId = simulateCreateRazorpayOrder(amountPaise, 'INR', paymentRequest.id);
      updatePaymentRequest(paymentRequest.id, { razorpayOrderId: orderId });

      // Step 3: Open Razorpay Checkout
      if (typeof window.Razorpay === 'undefined') {
        // Fallback for when Razorpay SDK is not loaded (demo mode)
        await simulatePaymentFlow(paymentRequest, orderId, amountPaise);
        return;
      }

      const options = {
        key: 'rzp_test_demo_key', // Test key - in production, from env
        amount: amountPaise,
        currency: 'INR',
        name: organisation.name,
        description: form.feeDescription,
        order_id: orderId,
        handler: async function(response: any) {
          // Step 4: Verify payment
          await verifyAndProcess(paymentRequest, orderId, response.razorpay_payment_id, response.razorpay_signature, response.razorpay_order_id, amountPaise);
        },
        prefill: {
          name: form.studentName,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#1a365d',
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            updatePaymentRequest(paymentRequest.id, { status: 'cancelled' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response: any) {
        setProcessing(false);
        updatePaymentRequest(paymentRequest.id, { status: 'failed' });
        navigate(`/payment/failed?pr=${paymentRequest.id}&reason=${encodeURIComponent(response.error.description || 'Payment failed')}`);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setProcessing(false);
      alert('An error occurred. Please try again.');
    }
  };

  const simulatePaymentFlow = async (paymentRequest: PaymentRequest, orderId: string, amountPaise: number) => {
    // Demo mode - simulate successful payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signature = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    
    await verifyAndProcess(paymentRequest, orderId, paymentId, signature, orderId, amountPaise);
  };

  const verifyAndProcess = async (
    paymentRequest: PaymentRequest,
    orderId: string,
    paymentId: string,
    signature: string,
    razorpayOrderId: string,
    amountPaise: number
  ) => {
    try {
      // Simulate server-side verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify signature (simulated)
      if (!signature || signature.length < 10) {
        updatePaymentRequest(paymentRequest.id, { status: 'failed' });
        navigate(`/payment/failed?pr=${paymentRequest.id}&reason=Payment verification failed`);
        return;
      }

      // Create payment record
      const payment = createPayment({
        paymentRequestId: paymentRequest.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentMethod: 'Online (Razorpay)',
        amountPaise,
        currency: 'INR',
        status: 'captured',
      });

      // Update payment request status
      updatePaymentRequest(paymentRequest.id, { status: 'captured', razorpayOrderId: orderId });

      // Generate receipt
      const receipt = createReceipt({
        paymentId: payment.id,
        paymentRequestId: paymentRequest.id,
        studentId: paymentRequest.studentId,
        studentName: paymentRequest.studentName,
        studentAdmissionId: paymentRequest.studentAdmissionId,
        course: paymentRequest.course,
        academicSession: paymentRequest.academicSession,
        parentName: paymentRequest.parentName,
        amount: amountPaise / 100,
        currency: 'INR',
        feeDescription: paymentRequest.feeDescription,
        paymentMethod: payment.paymentMethod,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
      });

      // Navigate to success page
      navigate(`/payment/success?receipt=${receipt.id}&pr=${paymentRequest.id}`);
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
                <span className="text-slate-400">Student Name</span>
                <span className="text-white font-medium">{form.studentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Student ID</span>
                <span className="text-white font-medium">{form.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Course</span>
                <span className="text-white font-medium">{form.course}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Academic Session</span>
                <span className="text-white font-medium">{form.academicSession}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Fee Description</span>
                <span className="text-white font-medium">{form.feeDescription === 'custom' ? 'Custom Fee' : form.feeDescription}</span>
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
                className="flex-1 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${amount.toFixed(2)}`
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              <i className="fas fa-lock mr-1"></i>
              Payments are secured by Razorpay. We never store your card details.
            </p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 border border-blue-700 mb-4">
            <i className="fas fa-graduation-cap text-2xl text-blue-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{organisation.name}</h1>
          <p className="text-slate-400 text-sm">Online Fee Payment Portal</p>
        </div>

        {/* Payment Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-file-invoice text-blue-400"></i>
            Fee Payment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Student Name *</label>
              <input
                type="text"
                value={form.studentName}
                onChange={e => setForm(prev => ({ ...prev, studentName: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.studentName ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                placeholder="Enter student name"
              />
              {errors.studentName && <p className="text-red-400 text-xs mt-1">{errors.studentName}</p>}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Student ID / Admission No. *</label>
              <input
                type="text"
                value={form.studentId}
                onChange={e => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.studentId ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                placeholder="e.g., STU-001"
              />
              {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Class / Course / Department *</label>
              <input
                type="text"
                value={form.course}
                onChange={e => setForm(prev => ({ ...prev, course: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.course ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                placeholder="e.g., B.Com (Hons)"
              />
              {errors.course && <p className="text-red-400 text-xs mt-1">{errors.course}</p>}
            </div>

            {/* Academic Session */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Academic Session</label>
              <input
                type="text"
                value={form.academicSession}
                onChange={e => setForm(prev => ({ ...prev, academicSession: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="e.g., 2026-27"
              />
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Parent / Payer Name</label>
              <input
                type="text"
                value={form.parentName}
                onChange={e => setForm(prev => ({ ...prev, parentName: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="Optional"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Mobile Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Fee Description */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Fee Description *</label>
              <select
                value={form.feeDescription}
                onChange={e => handleFeeSelect(e.target.value)}
                className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.feeDescription ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:border-blue-500 focus:outline-none transition`}
              >
                <option value="">Select fee type</option>
                {feeItems.map(fee => (
                  <option key={fee.id} value={fee.description}>
                    {fee.description} - ₹{fee.amount.toLocaleString('en-IN')}
                  </option>
                ))}
                <option value="custom">Custom Amount</option>
              </select>
              {errors.feeDescription && <p className="text-red-400 text-xs mt-1">{errors.feeDescription}</p>}
            </div>

            {/* Custom Amount */}
            {form.feeDescription === 'custom' && (
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={form.customAmount}
                  onChange={e => setForm(prev => ({ ...prev, customAmount: e.target.value }))}
                  className={`w-full px-3 py-2.5 bg-slate-900 border ${errors.customAmount ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition`}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
                {errors.customAmount && <p className="text-red-400 text-xs mt-1">{errors.customAmount}</p>}
              </div>
            )}
          </div>

          {/* Amount Display */}
          {amount > 0 && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">Amount Payable:</span>
                <span className="text-2xl font-bold text-white">₹{amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleProceed}
            className="w-full mt-6 py-3.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            <i className="fas fa-arrow-right mr-2"></i>
            Proceed to Payment
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span><i className="fas fa-shield-alt mr-1"></i>Secure Payment</span>
            <span><i className="fas fa-lock mr-1"></i>SSL Encrypted</span>
            <span><i className="fas fa-check-circle mr-1"></i>Razorpay Verified</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Powered by ReceiptFlow Payments | Razorpay Secure Checkout</p>
          <p className="mt-1">For any queries, contact: {organisation.email}</p>
          <p className="mt-2">
            <a href="#/admin" className="text-blue-400 hover:text-blue-300 transition">
              <i className="fas fa-shield-alt mr-1"></i>Admin Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
