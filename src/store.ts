import { v4 as uuidv4 } from 'uuid';
import type { AppState, Organisation, Student, FeeItem, PaymentRequest, Payment, Receipt, PaymentStatus } from './types';

const STORAGE_KEY = 'receiptflow_data';
const ADMIN_PASSWORD = 'admin123'; // In production, this would be server-side

const defaultOrganisation: Organisation = {
  id: 'org-1',
  name: 'Winners Creek International School',
  address: '42, Education Lane, Knowledge Park, Bengaluru, Karnataka - 560001',
  email: 'accounts@winnerscreek.edu.in',
  phone: '+91 80 4567 8900',
  gstin: '29AABCU9603R1ZM',
  logo: '',
  bankName: 'State Bank of India',
  bankAccount: '3876 1204 5890 012',
  bankIfsc: 'SBIN0001234',
  bankBranch: 'Knowledge Park Branch, Bengaluru',
  declaration: 'We declare that this invoice/receipt shows the true value of fees received. This is a computer-generated receipt.',
  receiptPrefix: 'WC',
  preparedBy: 'Accounts Department',
  authorisedSignatory: 'Principal',
  termsAndConditions: '1. Fees once paid is non-refundable.\n2. This receipt is valid only for the mentioned academic session.\n3. Please preserve this receipt for future reference.',
};

const defaultFeeItems: FeeItem[] = [
  { id: 'fee-1', description: 'Tuition Fees', amount: 15000, currency: 'INR', academicSession: '2026-27', active: true },
  { id: 'fee-2', description: 'Soft Skills Fees', amount: 850, currency: 'INR', academicSession: '2026-27', active: true },
  { id: 'fee-3', description: 'Lab Fees', amount: 2500, currency: 'INR', academicSession: '2026-27', active: true },
  { id: 'fee-4', description: 'Library Fees', amount: 1200, currency: 'INR', academicSession: '2026-27', active: true },
  { id: 'fee-5', description: 'Examination Fees', amount: 1800, currency: 'INR', academicSession: '2026-27', active: true },
  { id: 'fee-6', description: 'Transport Fees', amount: 3500, currency: 'INR', academicSession: '2026-27', active: true },
];

const defaultStudents: Student[] = [
  { id: 'stu-1', studentId: 'STU-001', name: 'Aarav Sharma', address: '12, MG Road, Bengaluru', email: 'aarav@example.com', phone: '+91 9876543210', course: 'B.Com (Hons)', academicSession: '2026-27' },
  { id: 'stu-2', studentId: 'STU-002', name: 'Priya Patel', address: '45, Brigade Road, Bengaluru', email: 'priya@example.com', phone: '+91 9876543211', course: 'B.Sc Computer Science', academicSession: '2026-27' },
  { id: 'stu-3', studentId: 'STU-003', name: 'Rohan Gupta', address: '78, Koramangala, Bengaluru', email: 'rohan@example.com', phone: '+91 9876543212', course: 'BBA', academicSession: '2026-27' },
];

function getDefaultState(): AppState {
  return {
    organisation: defaultOrganisation,
    students: defaultStudents,
    feeItems: defaultFeeItems,
    paymentRequests: [],
    payments: [],
    receipts: [],
    webhookEvents: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getOrganisation(): Organisation {
  return loadState().organisation;
}

export function updateOrganisation(org: Partial<Organisation>): Organisation {
  const state = loadState();
  state.organisation = { ...state.organisation, ...org };
  saveState(state);
  return state.organisation;
}

export function getStudents(): Student[] {
  return loadState().students;
}

export function addStudent(student: Omit<Student, 'id'>): Student {
  const state = loadState();
  const newStudent: Student = { ...student, id: uuidv4() };
  state.students.push(newStudent);
  saveState(state);
  return newStudent;
}

export function importStudents(students: Omit<Student, 'id'>[]): Student[] {
  const state = loadState();
  const newStudents = students.map(s => ({ ...s, id: uuidv4() }));
  state.students.push(...newStudents);
  saveState(state);
  return newStudents;
}

export function getFeeItems(): FeeItem[] {
  return loadState().feeItems;
}

export function addFeeItem(feeItem: Omit<FeeItem, 'id'>): FeeItem {
  const state = loadState();
  const newItem: FeeItem = { ...feeItem, id: uuidv4() };
  state.feeItems.push(newItem);
  saveState(state);
  return newItem;
}

export function createPaymentRequest(data: {
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
}): PaymentRequest {
  const state = loadState();
  const pr: PaymentRequest = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    razorpayOrderId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.paymentRequests.push(pr);
  saveState(state);
  return pr;
}

export function updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): PaymentRequest | null {
  const state = loadState();
  const idx = state.paymentRequests.findIndex(pr => pr.id === id);
  if (idx === -1) return null;
  state.paymentRequests[idx] = { ...state.paymentRequests[idx], ...updates, updatedAt: new Date().toISOString() };
  saveState(state);
  return state.paymentRequests[idx];
}

export function getPaymentRequest(id: string): PaymentRequest | null {
  return loadState().paymentRequests.find(pr => pr.id === id) || null;
}

export function getPaymentRequestByOrderId(orderId: string): PaymentRequest | null {
  return loadState().paymentRequests.find(pr => pr.razorpayOrderId === orderId) || null;
}

export function createPayment(data: {
  paymentRequestId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentMethod: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
}): Payment {
  const state = loadState();
  const payment: Payment = {
    id: uuidv4(),
    ...data,
    capturedAt: data.status === 'captured' ? new Date().toISOString() : null,
    failureReason: null,
    createdAt: new Date().toISOString(),
  };
  state.payments.push(payment);
  saveState(state);
  return payment;
}

export function updatePayment(id: string, updates: Partial<Payment>): Payment | null {
  const state = loadState();
  const idx = state.payments.findIndex(p => p.id === id);
  if (idx === -1) return null;
  state.payments[idx] = { ...state.payments[idx], ...updates };
  saveState(state);
  return state.payments[idx];
}

export function getPayment(id: string): Payment | null {
  return loadState().payments.find(p => p.id === id) || null;
}

export function getPaymentByRazorpayId(razorpayPaymentId: string): Payment | null {
  return loadState().payments.find(p => p.razorpayPaymentId === razorpayPaymentId) || null;
}

export function generateReceiptNumber(): string {
  const state = loadState();
  const prefix = state.organisation.receiptPrefix || 'RC';
  const year = new Date().getFullYear();
  const existingCount = state.receipts.filter(r => r.receiptNumber.startsWith(`${prefix}-${year}`)).length;
  const nextNumber = String(existingCount + 1).padStart(4, '0');
  return `${prefix}-${year}-${nextNumber}`;
}

export function createReceipt(data: {
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
}): Receipt {
  const state = loadState();
  // Idempotency check
  const existing = state.receipts.find(r => r.paymentId === data.paymentId);
  if (existing) return existing;
  
  const receipt: Receipt = {
    id: uuidv4(),
    receiptNumber: generateReceiptNumber(),
    ...data,
    issuedAt: new Date().toISOString(),
    status: 'issued',
  };
  state.receipts.push(receipt);
  saveState(state);
  return receipt;
}

export function getReceipt(id: string): Receipt | null {
  return loadState().receipts.find(r => r.id === id) || null;
}

export function getReceiptByNumber(number: string): Receipt | null {
  return loadState().receipts.find(r => r.receiptNumber === number) || null;
}

export function getReceiptByPaymentId(paymentId: string): Receipt | null {
  return loadState().receipts.find(r => r.paymentId === paymentId) || null;
}

export function getAllPaymentRequests(): PaymentRequest[] {
  return loadState().paymentRequests;
}

export function getAllPayments(): Payment[] {
  return loadState().payments;
}

export function getAllReceipts(): Receipt[] {
  return loadState().receipts;
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// Simulate Razorpay order creation (in production, this would be server-side)
export function simulateCreateRazorpayOrder(amountPaise: number, currency: string, receipt: string): string {
  // Generate a simulated Razorpay order ID
  const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
  return orderId;
}

// Simulate payment verification (in production, this would be server-side with actual Razorpay SDK)
export function simulateVerifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): { valid: boolean; paymentMethod: string } {
  // In test mode, we accept any signature that's non-empty
  if (!razorpaySignature || razorpaySignature.length < 10) {
    return { valid: false, paymentMethod: '' };
  }
  // Verify the order exists
  const pr = getPaymentRequestByOrderId(razorpayOrderId);
  if (!pr) {
    return { valid: false, paymentMethod: '' };
  }
  return { valid: true, paymentMethod: 'UPI' }; // Simulated payment method
}
