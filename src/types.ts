export interface Organisation {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  gstin: string;
  logo: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  declaration: string;
  receiptPrefix: string;
  preparedBy: string;
  authorisedSignatory: string;
  termsAndConditions: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  course: string;
  academicSession: string;
}

export interface FeeItem {
  id: string;
  description: string;
  amount: number;
  currency: string;
  academicSession: string;
  active: boolean;
}

export type PaymentStatus = 
  | 'pending'
  | 'created'
  | 'authorised'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded';

export interface PaymentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAdmissionId: string;
  course: string;
  academicSession: string;
  parentName: string;
  email: string;
  phone: string;
  feeDescription: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentRequestId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentMethod: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  capturedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  paymentRequestId: string;
  studentId: string;
  studentName: string;
  studentAdmissionId: string;
  course: string;
  academicSession: string;
  parentName: string;
  amount: number;
  currency: string;
  feeDescription: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  issuedAt: string;
  status: 'issued';
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  eventType: string;
  processed: boolean;
  receivedAt: string;
}

export interface AppState {
  organisation: Organisation;
  students: Student[];
  feeItems: FeeItem[];
  paymentRequests: PaymentRequest[];
  payments: Payment[];
  receipts: Receipt[];
  webhookEvents: WebhookEvent[];
}
