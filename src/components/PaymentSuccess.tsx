import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReceipt, getOrganisation } from '../store';
import type { Receipt, Organisation } from '../types';
import ReceiptView from './ReceiptView';
import { formatAmount } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Check, Download, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6 sm:mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful!</h1>
          <p className="text-3xl font-bold text-zinc-900 mb-4">{formatAmount(receipt.amount)}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-sm">
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
              <div className="text-zinc-500 text-xs">Name</div>
              <div className="text-zinc-900 font-medium truncate">{receipt.customerName}</div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
              <div className="text-zinc-500 text-xs">Receipt No.</div>
              <div className="text-zinc-900 font-medium font-mono text-xs">{receipt.receiptNumber}</div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
              <div className="text-zinc-500 text-xs">Payment ID</div>
              <div className="text-zinc-900 font-medium text-xs truncate">{receipt.razorpayPaymentId}</div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
              <div className="text-zinc-500 text-xs">Date</div>
              <div className="text-zinc-900 font-medium">{new Date(receipt.issuedAt).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6 sm:mb-8">
          <button
            onClick={downloadPdf}
            disabled={generatingPdf}
            className="btn-primary disabled:opacity-50"
          >
            {generatingPdf ? 'Generating...' : <><Download className="w-4 h-4" />Download PDF</>}
          </button>
          <button
            onClick={() => navigate(`/pay?org=${organisation.id}`)}
            className="btn-secondary"
          >
            <Home className="w-4 h-4" />Make Another Payment
          </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 overflow-x-auto">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Receipt Preview</h3>
          <div className="flex justify-center">
            <div className="transform scale-[0.4] sm:scale-[0.5] md:scale-[0.65] lg:scale-[0.75] origin-top">
              <ReceiptView ref={receiptRef} receipt={receipt} organisation={organisation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
