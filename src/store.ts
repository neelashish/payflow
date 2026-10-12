import { v4 as uuidv4 } from 'uuid';
import type { 
  PlatformState, 
  Organisation, 
  User, 
  Customer, 
  FeeCategory, 
  PaymentRequest, 
  Payment, 
  Receipt, 
  Invoice, 
  PaymentStatus,
  OrganisationType
} from './types';

const STORAGE_KEY = 'payflow_platform_data';

const PLATFORM_NAME = 'PayFlow';
const PLATFORM_TAGLINE = 'Payments and Receipts for Every Organisation';

function getDefaultState(): PlatformState {
  return {
    organisations: [],
    users: [],
    customers: [],
    feeCategories: [],
    paymentRequests: [],
    payments: [],
    receipts: [],
    invoices: [],
    webhookEvents: [],
    currentOrganisationId: null,
    currentUserId: null,
  };
}

export function loadState(): PlatformState {
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

export function saveState(state: PlatformState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Organisation management
export function registerOrganisation(data: {
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
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}): { organisation: Organisation; user: User } {
  const state = loadState();
  
  const org: Organisation = {
    id: uuidv4(),
    name: data.name,
    type: data.type,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: data.country || 'India',
    website: data.website,
    logo: '',
    gstin: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: '',
    declaration: 'We declare that this receipt shows the true value of fees received.',
    receiptPrefix: 'RC',
    invoicePrefix: 'INV',
    currency: 'INR',
    receiptFooter: '',
    termsAndConditions: 'This is a computer-generated receipt.',
    preparedBy: 'Accounts Department',
    authorisedSignatory: 'Authorised Signatory',
    signatoryImage: '',
    razorpayKeyId: '',
    razorpayConfigured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };
  
  const user: User = {
    id: uuidv4(),
    organisationId: org.id,
    email: data.adminEmail,
    name: data.adminName,
    role: 'owner',
    passwordHash: btoa(data.adminPassword), // Simple encoding for demo
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  
  state.organisations.push(org);
  state.users.push(user);
  saveState(state);
  
  return { organisation: org, user };
}

export function getOrganisation(id: string): Organisation | null {
  return loadState().organisations.find(o => o.id === id) || null;
}

export function updateOrganisation(id: string, updates: Partial<Organisation>): Organisation | null {
  const state = loadState();
  const idx = state.organisations.findIndex(o => o.id === id);
  if (idx === -1) return null;
  state.organisations[idx] = { ...state.organisations[idx], ...updates, updatedAt: new Date().toISOString() };
  saveState(state);
  return state.organisations[idx];
}

export function getAllOrganisations(): Organisation[] {
  return loadState().organisations.filter(o => o.isActive);
}

// User management
export function authenticateUser(email: string, password: string): User | null {
  const state = loadState();
  const user = state.users.find(u => u.email === email && u.passwordHash === btoa(password) && u.isActive);
  return user || null;
}

export function getUser(id: string): User | null {
  return loadState().users.find(u => u.id === id) || null;
}

export function getUsersByOrganisation(orgId: string): User[] {
  return loadState().users.filter(u => u.organisationId === orgId && u.isActive);
}

export function setCurrentOrganisation(orgId: string | null): void {
  const state = loadState();
  state.currentOrganisationId = orgId;
  saveState(state);
}

export function setCurrentUser(userId: string | null): void {
  const state = loadState();
  state.currentUserId = userId;
  saveState(state);
}

export function getCurrentOrganisation(): Organisation | null {
  const state = loadState();
  if (!state.currentOrganisationId) return null;
  return getOrganisation(state.currentOrganisationId);
}

export function getCurrentUser(): User | null {
  const state = loadState();
  if (!state.currentUserId) return null;
  return getUser(state.currentUserId);
}

// Customer management
export function addCustomer(orgId: string, data: Omit<Customer, 'id' | 'organisationId' | 'createdAt'>): Customer {
  const state = loadState();
  const customer: Customer = {
    id: uuidv4(),
    organisationId: orgId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  state.customers.push(customer);
  saveState(state);
  return customer;
}

export function getCustomersByOrganisation(orgId: string): Customer[] {
  return loadState().customers.filter(c => c.organisationId === orgId);
}

export function importCustomers(orgId: string, customers: Omit<Customer, 'id' | 'organisationId' | 'createdAt'>[]): Customer[] {
  const state = loadState();
  const newCustomers = customers.map(c => ({
    id: uuidv4(),
    organisationId: orgId,
    ...c,
    createdAt: new Date().toISOString(),
  }));
  state.customers.push(...newCustomers);
  saveState(state);
  return newCustomers;
}

// Fee category management
export function addFeeCategory(orgId: string, data: Omit<FeeCategory, 'id' | 'organisationId' | 'createdAt'>): FeeCategory {
  const state = loadState();
  const category: FeeCategory = {
    id: uuidv4(),
    organisationId: orgId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  state.feeCategories.push(category);
  saveState(state);
  return category;
}

export function getFeeCategoriesByOrganisation(orgId: string): FeeCategory[] {
  return loadState().feeCategories.filter(f => f.organisationId === orgId);
}

// Payment request management
export function createPaymentRequest(orgId: string, data: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerReferenceId: string;
  feeCategoryId: string;
  feeDescription: string;
  amountPaise: number;
  currency: string;
  description: string;
  dueDate: string | null;
}): PaymentRequest {
  const state = loadState();
  const pr: PaymentRequest = {
    id: uuidv4(),
    organisationId: orgId,
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

export function getPaymentRequestsByOrganisation(orgId: string): PaymentRequest[] {
  return loadState().paymentRequests.filter(pr => pr.organisationId === orgId);
}

// Payment management
export function createPayment(orgId: string, data: {
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
    organisationId: orgId,
    ...data,
    capturedAt: data.status === 'captured' ? new Date().toISOString() : null,
    failureReason: null,
    createdAt: new Date().toISOString(),
  };
  state.payments.push(payment);
  saveState(state);
  return payment;
}

export function getPayment(id: string): Payment | null {
  return loadState().payments.find(p => p.id === id) || null;
}

export function getPaymentByRazorpayId(razorpayPaymentId: string): Payment | null {
  return loadState().payments.find(p => p.razorpayPaymentId === razorpayPaymentId) || null;
}

export function getPaymentsByOrganisation(orgId: string): Payment[] {
  return loadState().payments.filter(p => p.organisationId === orgId);
}

// Receipt management
export function generateReceiptNumber(orgId: string): string {
  const state = loadState();
  const org = state.organisations.find(o => o.id === orgId);
  if (!org) return 'RC-0001';
  
  const prefix = org.receiptPrefix || 'RC';
  const year = new Date().getFullYear();
  const existingCount = state.receipts.filter(r => 
    r.organisationId === orgId && r.receiptNumber.startsWith(`${prefix}-${year}`)
  ).length;
  const nextNumber = String(existingCount + 1).padStart(4, '0');
  return `${prefix}-${year}-${nextNumber}`;
}

export function createReceipt(orgId: string, data: {
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
}): Receipt {
  const state = loadState();
  
  // Idempotency check
  const existing = state.receipts.find(r => r.paymentId === data.paymentId);
  if (existing) return existing;
  
  const receipt: Receipt = {
    id: uuidv4(),
    organisationId: orgId,
    receiptNumber: generateReceiptNumber(orgId),
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

export function getReceiptByPaymentId(paymentId: string): Receipt | null {
  return loadState().receipts.find(r => r.paymentId === paymentId) || null;
}

export function getReceiptsByOrganisation(orgId: string): Receipt[] {
  return loadState().receipts.filter(r => r.organisationId === orgId);
}

// Invoice management
export function generateInvoiceNumber(orgId: string): string {
  const state = loadState();
  const org = state.organisations.find(o => o.id === orgId);
  if (!org) return 'INV-0001';
  
  const prefix = org.invoicePrefix || 'INV';
  const year = new Date().getFullYear();
  const existingCount = state.invoices.filter(i => 
    i.organisationId === orgId && i.invoiceNumber.startsWith(`${prefix}-${year}`)
  ).length;
  const nextNumber = String(existingCount + 1).padStart(4, '0');
  return `${prefix}-${year}-${nextNumber}`;
}

export function createInvoice(orgId: string, data: {
  paymentRequestId: string;
  customerId: string;
  customerName: string;
  customerReferenceId: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: string | null;
}): Invoice {
  const state = loadState();
  const invoice: Invoice = {
    id: uuidv4(),
    organisationId: orgId,
    invoiceNumber: generateInvoiceNumber(orgId),
    ...data,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  state.invoices.push(invoice);
  saveState(state);
  return invoice;
}

export function getInvoicesByOrganisation(orgId: string): Invoice[] {
  return loadState().invoices.filter(i => i.organisationId === orgId);
}

// Razorpay simulation (in production, this would be server-side)
export function simulateCreateRazorpayOrder(amountPaise: number, currency: string, receipt: string): string {
  return `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
}

export function simulateVerifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): { valid: boolean; paymentMethod: string } {
  if (!razorpaySignature || razorpaySignature.length < 10) {
    return { valid: false, paymentMethod: '' };
  }
  const pr = getPaymentRequestByOrderId(razorpayOrderId);
  if (!pr) {
    return { valid: false, paymentMethod: '' };
  }
  return { valid: true, paymentMethod: 'UPI' };
}

// Platform info
export function getPlatformName(): string {
  return PLATFORM_NAME;
}

export function getPlatformTagline(): string {
  return PLATFORM_TAGLINE;
}

// ============================================================
// DEMO MODE - Completely isolated from real data
// ============================================================

const DEMO_STORAGE_KEY = 'payflow_demo_data';

export interface DemoState {
  organisation: {
    id: string;
    name: string;
    type: string;
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
    termsAndConditions: string;
    preparedBy: string;
    authorisedSignatory: string;
  };
  paymentRequests: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerReferenceId: string;
    paymentId: string | null;
    receiptNumber: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
  receiptCounter: number;
}

function getDefaultDemoState(): DemoState {
  return {
    organisation: {
      id: 'demo-org-northstar',
      name: 'Northstar Learning Centre',
      type: 'Coaching Institute',
      email: 'accounts@northstar-learning.example.com',
      phone: '+91 98450 12345',
      address: '14, Academic Avenue, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
      website: 'https://northstar-learning.example.com',
      logo: '',
      gstin: '',
      bankName: 'HDFC Bank',
      bankAccount: '50100123456789',
      bankIfsc: 'HDFC0001234',
      bankBranch: 'Indiranagar Branch, Bengaluru',
      declaration: 'This is a computer-generated receipt. We declare that this shows the true value of fees received.',
      receiptPrefix: 'NS-DEMO',
      termsAndConditions: '1. This is a DEMO receipt for demonstration purposes only.\n2. No real payment has been processed.\n3. This document is NOT proof of payment.',
      preparedBy: 'Demo Accounts Dept.',
      authorisedSignatory: 'Demo Principal',
    },
    paymentRequests: [
      {
        id: 'demo-pr-1',
        title: 'Course Registration',
        description: 'Registration fee for Advanced Mathematics course',
        amount: 500,
        status: 'pending',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerReferenceId: '',
        paymentId: null,
        receiptNumber: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
      },
      {
        id: 'demo-pr-2',
        title: 'Tuition Fee — Term 1',
        description: 'Monthly tuition fee for January 2026',
        amount: 2000,
        status: 'pending',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerReferenceId: '',
        paymentId: null,
        receiptNumber: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
      },
      {
        id: 'demo-pr-3',
        title: 'Event Registration',
        description: 'Annual Science Fair 2026 participation fee',
        amount: 750,
        status: 'pending',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerReferenceId: '',
        paymentId: null,
        receiptNumber: null,
        createdAt: new Date().toISOString(),
        paidAt: null,
      },
      // Pre-existing completed transactions for realistic dashboard
      {
        id: 'demo-pr-hist-1',
        title: 'Tuition Fee — December',
        description: 'Monthly tuition fee for December 2025',
        amount: 2000,
        status: 'paid',
        customerName: 'Ananya Iyer',
        customerEmail: 'ananya@example.com',
        customerPhone: '+91 98765 43210',
        customerReferenceId: 'NS-2025-042',
        paymentId: 'pay_demo_hist_001',
        receiptNumber: 'NS-DEMO-2025-0001',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-pr-hist-2',
        title: 'Lab Fees',
        description: 'Science laboratory access fee',
        amount: 1500,
        status: 'paid',
        customerName: 'Vikram Desai',
        customerEmail: 'vikram@example.com',
        customerPhone: '+91 98765 43211',
        customerReferenceId: 'NS-2025-043',
        paymentId: 'pay_demo_hist_002',
        receiptNumber: 'NS-DEMO-2025-0002',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-pr-hist-3',
        title: 'Workshop Registration',
        description: 'Creative Writing Workshop',
        amount: 800,
        status: 'paid',
        customerName: 'Meera Krishnan',
        customerEmail: 'meera@example.com',
        customerPhone: '+91 98765 43212',
        customerReferenceId: 'NS-2025-044',
        paymentId: 'pay_demo_hist_003',
        receiptNumber: 'NS-DEMO-2025-0003',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-pr-hist-4',
        title: 'Exam Fee',
        description: 'Mid-term examination fee',
        amount: 600,
        status: 'failed',
        customerName: 'Arjun Nair',
        customerEmail: 'arjun@example.com',
        customerPhone: '+91 98765 43213',
        customerReferenceId: 'NS-2025-045',
        paymentId: 'pay_demo_hist_004',
        receiptNumber: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: null,
      },
    ],
    receiptCounter: 3,
  };
}

export function loadDemoState(): DemoState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load demo state:', e);
  }
  const defaultState = getDefaultDemoState();
  saveDemoState(defaultState);
  return defaultState;
}

export function saveDemoState(state: DemoState): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function resetDemoState(): DemoState {
  const defaultState = getDefaultDemoState();
  saveDemoState(defaultState);
  return defaultState;
}

export function getDemoStats() {
  const state = loadDemoState();
  const paid = state.paymentRequests.filter(pr => pr.status === 'paid');
  const pending = state.paymentRequests.filter(pr => pr.status === 'pending');
  const failed = state.paymentRequests.filter(pr => pr.status === 'failed');
  const totalCollected = paid.reduce((sum, pr) => sum + pr.amount, 0);

  return {
    totalCollected,
    successfulCount: paid.length,
    pendingCount: pending.length,
    failedCount: failed.length,
    receiptsCount: paid.length,
  };
}

export function updateDemoPaymentRequest(
  id: string,
  updates: Partial<DemoState['paymentRequests'][0]>
): void {
  const state = loadDemoState();
  const idx = state.paymentRequests.findIndex(pr => pr.id === id);
  if (idx !== -1) {
    state.paymentRequests[idx] = { ...state.paymentRequests[idx], ...updates };
    saveDemoState(state);
  }
}

export function generateDemoReceiptNumber(): string {
  const state = loadDemoState();
  state.receiptCounter += 1;
  const num = String(state.receiptCounter).padStart(4, '0');
  const year = new Date().getFullYear();
  saveDemoState(state);
  return `${state.organisation.receiptPrefix}-${year}-${num}`;
}

export function generateDemoPaymentId(): string {
  return `pay_demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Demo data seeder
export function seedDemoOrganisation(): { organisation: Organisation; user: User } {
  const state = loadState();
  
  // Check if demo org already exists
  const existingDemo = state.organisations.find(o => o.email === 'demo@eduglobal.in');
  if (existingDemo) {
    const demoUser = state.users.find(u => u.organisationId === existingDemo.id);
    return { organisation: existingDemo, user: demoUser! };
  }
  
  const org: Organisation = {
    id: uuidv4(),
    name: 'EduGlobal International Academy',
    type: 'school',
    email: 'accounts@eduglobal.in',
    phone: '+91 80 4567 8900',
    address: '42, Education Lane, Knowledge Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    website: 'https://eduglobal.example.com',
    logo: '',
    gstin: '29AABCU9603R1ZM',
    bankName: 'State Bank of India',
    bankAccount: '3876 1204 5890 012',
    bankIfsc: 'SBIN0001234',
    bankBranch: 'Knowledge Park Branch, Bengaluru',
    declaration: 'We declare that this receipt shows the true value of fees received. This is a computer-generated receipt.',
    receiptPrefix: 'EG',
    invoicePrefix: 'EG-INV',
    currency: 'INR',
    receiptFooter: 'This is a computer generated receipt. For queries, contact accounts@eduglobal.in',
    termsAndConditions: '1. Fees once paid is non-refundable.\n2. This receipt is valid only for the mentioned academic session.\n3. Please preserve this receipt for future reference.',
    preparedBy: 'Accounts Department',
    authorisedSignatory: 'Principal',
    signatoryImage: '',
    razorpayKeyId: '',
    razorpayConfigured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };
  
  const user: User = {
    id: uuidv4(),
    organisationId: org.id,
    email: 'admin@eduglobal.in',
    name: 'Demo Admin',
    role: 'owner',
    passwordHash: btoa('demo123'),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  
  // Add demo fee categories
  const feeCategories: FeeCategory[] = [
    { id: uuidv4(), organisationId: org.id, name: 'Tuition Fees', description: 'Monthly tuition fees', defaultAmount: 15000, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, name: 'Lab Fees', description: 'Science laboratory fees', defaultAmount: 2500, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, name: 'Library Fees', description: 'Annual library membership', defaultAmount: 1200, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, name: 'Examination Fees', description: 'Term examination fees', defaultAmount: 1800, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, name: 'Transport Fees', description: 'Monthly transport charges', defaultAmount: 3500, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, name: 'Soft Skills Program', description: 'Personality development course', defaultAmount: 850, currency: 'INR', isActive: true, createdAt: new Date().toISOString() },
  ];
  
  // Add demo customers
  const demoCustomers: Customer[] = [
    { id: uuidv4(), organisationId: org.id, customerId: 'STU-001', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9876543210', address: '12, MG Road, Bengaluru', referenceType: 'student', referenceId: 'STU-001', additionalInfo: 'B.Com (Hons)', createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, customerId: 'STU-002', name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543211', address: '45, Brigade Road, Bengaluru', referenceType: 'student', referenceId: 'STU-002', additionalInfo: 'B.Sc Computer Science', createdAt: new Date().toISOString() },
    { id: uuidv4(), organisationId: org.id, customerId: 'STU-003', name: 'Rohan Gupta', email: 'rohan@example.com', phone: '+91 9876543212', address: '78, Koramangala, Bengaluru', referenceType: 'student', referenceId: 'STU-003', additionalInfo: 'BBA', createdAt: new Date().toISOString() },
  ];
  
  state.organisations.push(org);
  state.users.push(user);
  state.feeCategories.push(...feeCategories);
  state.customers.push(...demoCustomers);
  saveState(state);
  
  return { organisation: org, user };
}
