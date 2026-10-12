// Multi-tenant types for PayFlow platform

export type OrganisationType = 
  | 'school'
  | 'college_university'
  | 'coaching_institute'
  | 'ngo_charity'
  | 'club_association'
  | 'healthcare'
  | 'business_service'
  | 'other';

export interface Organisation {
  id: string;
  name: string;
  type: OrganisationType;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  website: string;
  logo: string;
  gstin: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  declaration: string;
  receiptPrefix: string;
  invoicePrefix: string;
  currency: string;
  receiptFooter: string;
  termsAndConditions: string;
  preparedBy: string;
  authorisedSignatory: string;
  signatoryImage: string;
  razorpayKeyId: string;
  razorpayConfigured: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface User {
  id: string;
  organisationId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'staff';
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  organisationId: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  referenceType: string; // student, member, patient, customer, etc.
  referenceId: string; // student ID, member ID, etc.
  additionalInfo: string;
  createdAt: string;
}

export interface FeeCategory {
  id: string;
  organisationId: string;
  name: string;
  description: string;
  defaultAmount: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
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
  organisationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerReferenceId: string;
  feeCategoryId: string;
  feeDescription: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string | null;
  dueDate: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  organisationId: string;
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
  organisationId: string;
  receiptNumber: string;
  paymentId: string;
  paymentRequestId: string;
  customerId: string;
  customerName: string;
  customerReferenceId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  feeDescription: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  issuedAt: string;
  status: 'issued';
}

export interface Invoice {
  id: string;
  organisationId: string;
  invoiceNumber: string;
  paymentRequestId: string;
  customerId: string;
  customerName: string;
  customerReferenceId: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: string | null;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  organisationId: string;
  eventId: string;
  eventType: string;
  processed: boolean;
  receivedAt: string;
}

export interface PlatformState {
  organisations: Organisation[];
  users: User[];
  customers: Customer[];
  feeCategories: FeeCategory[];
  paymentRequests: PaymentRequest[];
  payments: Payment[];
  receipts: Receipt[];
  invoices: Invoice[];
  webhookEvents: WebhookEvent[];
  currentOrganisationId: string | null;
  currentUserId: string | null;
}
