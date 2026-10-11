import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReceipt, getPaymentRequest, getOrganisation } from '../store';
import type { Receipt, PaymentRequest, Organisation } from '../types';
import ReceiptView from './ReceiptView';
import { formatAmount } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const receiptId = searchParams.get('receipt');
    if (receiptId) {
      const r = getReceipt(receiptId);
      setReceipt(r);
      if (r) {
        const pr = getPaymentRequest(r.paymentRequestId);
        setPaymentRequest(pr);
      }
    }
    setOrganisation(getOrganisation());
  }, [searchParams]);

  const downloadPdf = async () => {
    if (!receiptRef.current || !receipt || !organisation) return;
    
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width at 96dpi
        windowWidth: 794,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;
      
      pdf.addImage(imgData, 'PNG', (pdfWidth - width) / 2, 0, width, height);
      pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
    setGeneratingPdf(false);
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt?.receiptNumber}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; }
          </style>
        </head>
        <body>${receiptRef.current.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!receipt || !organisation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl p-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-800 border-2 border-green-500 mb-4">
            <i className="fas fa-check text-3xl text-green-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h1>
          <p className="text-3xl font-bold text-white mb-4">{formatAmount(receipt.amount)}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs">Student</div>
              <div className="text-white font-medium">{receipt.studentName}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs">Receipt No.</div>
              <div className="text-white font-medium">{receipt.receiptNumber}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs">Payment ID</div>
              <div className="text-white font-medium text-xs truncate">{receipt.razorpayPaymentId}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs">Date</div>
              <div className="text-white font-medium">{new Date(receipt.issuedAt).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={downloadPdf}
            disabled={generatingPdf}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {generatingPdf ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Download Receipt PDF
              </>
            )}
          </button>
          <button
            onClick={printReceipt}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <i className="fas fa-print"></i>
            Print Receipt
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <i className="fas fa-home"></i>
            Return to Home
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 overflow-x-auto">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <i className="fas fa-file-alt text-blue-400"></i>
            Receipt Preview
          </h3>
          <div className="flex justify-center">
            <div className="transform scale-[0.6] md:scale-[0.7] lg:scale-[0.8] origin-top">
              <ReceiptView ref={receiptRef} receipt={receipt} organisation={organisation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
