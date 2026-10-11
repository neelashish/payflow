import { forwardRef } from 'react';
import type { Receipt, Organisation } from '../types';
import { amountInWords, formatAmount, formatDate } from '../utils/format';

interface ReceiptViewProps {
  receipt: Receipt;
  organisation: Organisation;
}

const ReceiptView = forwardRef<HTMLDivElement, ReceiptViewProps>(({ receipt, organisation }, ref) => {
  return (
    <div ref={ref} className="receipt-container" style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '15mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
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
      
      <div style={{ padding: '5mm' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            {organisation.logo && (
              <img src={organisation.logo} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            )}
            {!organisation.logo && (
              <div style={{ width: '60px', height: '60px', backgroundColor: '#1a365d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                {organisation.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1a365d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {organisation.name}
              </h1>
              <p style={{ margin: '0', fontSize: '9pt', color: '#555' }}>{organisation.address}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#555' }}>
                Email: {organisation.email} | Phone: {organisation.phone}
                {organisation.gstin && ` | GSTIN: ${organisation.gstin}`}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '12px', backgroundColor: '#1a365d', color: '#fff', padding: '6px 20px', display: 'inline-block', borderRadius: '3px', fontSize: '13pt', fontWeight: 'bold', letterSpacing: '2px' }}>
            PAYMENT RECEIPT
          </div>
        </div>

        {/* Receipt Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '8px 12px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
          <div>
            <div style={{ fontSize: '9pt', color: '#666' }}>Receipt No.</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{receipt.receiptNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: '9pt', color: '#666' }}>Date</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>{formatDate(receipt.issuedAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: '9pt', color: '#666' }}>Status</div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt', color: '#16a34a' }}>✓ PAID</div>
          </div>
        </div>

        {/* Recipient Details */}
        <div style={{ marginBottom: '15px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', fontWeight: 'bold', fontSize: '10pt', borderBottom: '1px solid #dee2e6' }}>
            RECEIVED FROM
          </div>
          <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10pt' }}>
            <div><strong>Name:</strong> {receipt.studentName}</div>
            <div><strong>Student ID:</strong> {receipt.studentAdmissionId}</div>
            <div><strong>Course:</strong> {receipt.course}</div>
            <div><strong>Session:</strong> {receipt.academicSession}</div>
            {receipt.parentName && <div><strong>Parent/Guardian:</strong> {receipt.parentName}</div>}
          </div>
        </div>

        {/* Particulars Table */}
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
              <td style={{ padding: '8px 12px', border: '1px solid #dee2e6' }}>{receipt.feeDescription}</td>
              <td style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{formatAmount(receipt.amount)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
              <td colSpan={2} style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Total Amount</td>
              <td style={{ padding: '8px 12px', border: '1px solid #dee2e6', textAlign: 'right', fontSize: '12pt', color: '#1a365d' }}>{formatAmount(receipt.amount)}</td>
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
            PAYMENT DETAILS
          </div>
          <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9pt' }}>
            <div><strong>Payment Method:</strong> {receipt.paymentMethod || 'Online'}</div>
            <div><strong>Payment ID:</strong> {receipt.razorpayPaymentId}</div>
            <div><strong>Order ID:</strong> {receipt.razorpayOrderId}</div>
            <div><strong>Payment Date:</strong> {formatDate(receipt.issuedAt)}</div>
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
});

ReceiptView.displayName = 'ReceiptView';
export default ReceiptView;
