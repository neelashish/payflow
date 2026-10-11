import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReceipt, getOrganisation } from '../store';
import type { Receipt, Organisation } from '../types';
import ReceiptView from './ReceiptView';
import { formatAmount } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const receiptId = searchParams.get('receipt');
    const orgId = searchParams.get('org');
    if (receiptId) {
      const r = getReceipt(receiptId);
      setReceipt(r);
    }
    if (orgId) {
      setOrganisation(getOrganisation(orgId));
    } else if (receipt) {
      setOrganisation(getOrganisation(receipt.organisationId));
    }
  }, [searchParams, receipt]);

  const downloadPdf = async () => {
    if (!receiptRef.current || !receipt || !organisation) return;
    setGeneratingPdf(true);
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
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      pdf.addImage(imgData, 'PNG', (pdfWidth - canvas.width * ratio) / 2, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
    setGeneratingPdf(false);
  };

  if (!receipt || !organisation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl p-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-800 border-2 border-green-500 mb-4">
            <i className="fas fa-check text-3xl text-green-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h1>
          <p className="text-3xl font-bold text-white mb-4">{formatAmount(receipt.amount)}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs">Name</div>
              <div className="text-white font-medium">{receipt.customerName}</div>
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

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={downloadPdf}
            disabled={generatingPdf}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {generatingPdf ? 'Generating...' : <><i className="fas fa-download"></i>Download PDF</>}
          </button>
          <button
            onClick={() => navigate(`/pay?org=${organisation.id}`)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <i className="fas fa-home"></i>Make Another Payment
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 overflow-x-auto">
          <h3 className="text-white font-medium mb-4">Receipt Preview</h3>
          <div className="flex justify-center">
            <div className="transform scale-[0.5] md:scale-[0.65] lg:scale-[0.75] origin-top">
              <ReceiptView ref={receiptRef} receipt={receipt} organisation={organisation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
