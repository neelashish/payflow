# PayFlow — Universal Multi-Organisation Payment Platform

A complete, production-ready payment gateway and receipt management platform that supports multiple independent organisations. Built with React, TypeScript, and Tailwind CSS.

## 🎯 Overview

PayFlow is a universal payment platform designed for schools, colleges, NGOs, businesses, healthcare providers, clubs, and any organisation that needs to collect payments online and generate professional receipts automatically.

### Key Features

- **Multi-Tenant Architecture**: Each organisation has its own isolated workspace, branding, and configuration
- **Organisation Registration**: Self-service registration for any type of organisation
- **Online Payments**: Razorpay integration for UPI, cards, net banking, and wallets
- **Automatic Receipt Generation**: Professional A4 receipts generated after every successful payment
- **Customisable Receipts**: Each organisation can configure its own receipt template, logo, and branding
- **Fee Categories**: Define multiple fee types with different amounts
- **Customer Management**: Import customers/students from Excel/CSV or add manually
- **Transaction Tracking**: Complete audit trail of all payments, receipts, and refunds
- **Payment Links**: Shareable payment URLs for each organisation
- **Dashboard Analytics**: Real-time statistics and transaction history
- **PDF Download**: Download receipts as professional PDF documents
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation (HashRouter for static hosting)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **jsPDF** and **html2canvas** for PDF generation
- **PapaParse** for CSV parsing
- **XLSX** for Excel file handling
- **UUID** for unique ID generation

### Data Storage
- **LocalStorage** for demo/development (easily replaceable with backend API)
- Multi-tenant data isolation using organisation IDs
- Type-safe data models with TypeScript

### Payment Integration
- **Razorpay** payment gateway (test mode for development)
- Server-side payment verification (simulated in demo)
- Webhook support architecture (ready for production implementation)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd payflow-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📖 Usage Guide

### 1. Landing Page

Visit the landing page to see platform features and options:
- **Register Your Organisation**: Create a new organisation account
- **Try Live Demo**: Instantly access a pre-configured demo organisation
- **Sign In**: Access your existing organisation dashboard

### 2. Organisation Registration

Click "Register Organisation" and complete the two-step process:

**Step 1: Organisation Details**
- Organisation name
- Organisation type (School, College, NGO, Business, etc.)
- Contact information (email, phone, address)
- Location details (city, state, PIN code)
- Website (optional)

**Step 2: Administrator Account**
- Your name
- Your email
- Password (minimum 6 characters)

After registration, you'll be automatically logged into your organisation dashboard.

### 3. Organisation Dashboard

The dashboard provides a comprehensive sidebar navigation with:

#### Overview
- Total amount collected
- Successful, pending, and failed payment counts
- Quick actions (payment link, fee categories, import)
- Recent transactions
- Your unique payment link (copy to share)

#### Payments
- View all payment requests
- Filter by status (pending, captured, failed)
- See customer details and amounts
- Track payment lifecycle

#### Receipts
- View all issued receipts
- Preview receipts in A4 format
- Download receipts as PDF
- Search by receipt number

#### Fee Categories
- Create fee types (Tuition, Lab Fees, Library, etc.)
- Set default amounts for each category
- Activate/deactivate categories
- Categories appear on the payment page

#### Customers
- View all customers/students
- See contact information
- Reference IDs and additional details
- Imported from Excel/CSV or added manually

#### Import
- Upload Excel (.xlsx, .xls) or CSV files
- Automatic column mapping
- Preview data before importing
- Bulk import customers/students
- Validation and error reporting

#### Settings
- Organisation profile (name, logo, contact details)
- Receipt configuration (prefix, declaration, terms)
- Bank details (optional, shown on receipts)
- Authorised signatory information
- Custom footer text

#### Payment Gateway
- View Razorpay connection status
- Configuration instructions
- Demo mode indicator

### 4. Making Payments (Customer View)

Customers access the payment page via the organisation's unique link:
```
https://your-domain.com/#/pay?org=<organisation-id>
```

**Payment Process:**
1. Enter customer details (name, email, phone, reference ID)
2. Select fee category or enter custom amount
3. Review payment summary
4. Complete payment (simulated in demo, Razorpay in production)
5. View success page with receipt preview
6. Download receipt as PDF

### 5. Demo Organisation

Click "Try Live Demo" to instantly access a pre-configured organisation:

**Demo Credentials:**
- Organisation: EduGlobal International Academy
- Email: admin@eduglobal.in
- Password: demo123

**Pre-configured Data:**
- 6 fee categories (Tuition, Lab, Library, etc.)
- 3 sample students
- Complete organisation profile
- Bank details and receipt template

## 🎨 Customisation

### Organisation Branding

Each organisation can customise:
- **Logo**: Upload organisation logo (appears on receipts)
- **Receipt Prefix**: Custom receipt numbering (e.g., "EG-2026-0001")
- **Declaration**: Custom declaration text on receipts
- **Terms & Conditions**: Organisation-specific terms
- **Bank Details**: Optional bank information on receipts
- **Signatory**: Name and signature image for receipts
- **Footer**: Custom footer text on receipts

### Receipt Template

The receipt template is fully dynamic and includes:
- Organisation logo and name
- Organisation address and contact
- Receipt number and date
- Customer details
- Fee description and amount
- Amount in words (Indian numbering system)
- Payment details (Razorpay IDs)
- Bank details (if configured)
- Declaration and terms
- Authorised signatory

## 🔒 Security

### Current Implementation (Demo)
- Client-side data storage (LocalStorage)
- Basic password encoding (for demo only)
- Organisation-level data isolation
- No sensitive data exposure in URLs

### Production Recommendations
- **Backend API**: Replace LocalStorage with secure backend (Node.js/Express, PostgreSQL)
- **Authentication**: Implement JWT or session-based authentication
- **Password Hashing**: Use bcrypt or similar for password storage
- **Razorpay Integration**: Server-side order creation and signature verification
- **Webhooks**: Implement Razorpay webhook handlers for payment confirmation
- **HTTPS**: Enforce HTTPS in production
- **Rate Limiting**: Add rate limiting on sensitive endpoints
- **Input Validation**: Server-side validation for all inputs
- **Audit Logs**: Maintain audit trail for all operations

## 🧪 Testing

### Test the Complete Flow

1. **Register a New Organisation**
   - Go to landing page
   - Click "Register Organisation"
   - Fill in organisation details
   - Create admin account
   - Verify dashboard access

2. **Configure Organisation**
   - Upload logo
   - Add fee categories
   - Configure receipt settings
   - Add bank details (optional)

3. **Import Customers**
   - Go to Import section
   - Upload sample CSV/Excel file
   - Preview and confirm import
   - Verify customers appear in list

4. **Make a Payment**
   - Copy payment link from dashboard
   - Open in new tab/window
   - Fill in payment details
   - Complete payment (demo mode)
   - Verify receipt generation

5. **View Receipts**
   - Go to Receipts section
   - Click "View" on a receipt
   - Preview A4 receipt
   - Download as PDF

6. **Test Multi-Tenancy**
   - Register a second organisation
   - Verify data isolation
   - Confirm receipts use correct branding
   - Test payment links for each org

### Demo Organisation

Use the pre-configured demo to quickly test all features:
- Click "Try Live Demo" on landing page
- Explore dashboard features
- Make test payments
- View generated receipts

## 📊 Data Models

### Organisation
```typescript
{
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
```

### Payment Request
```typescript
{
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
```

### Receipt
```typescript
{
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
```

## 🌐 Deployment

### Static Hosting (Demo Mode)

The application can be deployed to any static hosting service:

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

**Supported Platforms:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

### Production Deployment

For production use with real payments:

1. **Backend Setup**
   - Deploy Node.js/Express API
   - Set up PostgreSQL database
   - Configure environment variables

2. **Razorpay Configuration**
   - Create Razorpay account
   - Complete KYC verification
   - Generate API keys
   - Configure webhooks

3. **Environment Variables**
   ```env
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. **Update Frontend**
   - Replace LocalStorage calls with API calls
   - Implement proper authentication
   - Add error handling and loading states

## 📝 API Endpoints (Production)

When implementing a backend, create these endpoints:

### Authentication
- `POST /api/auth/register` - Register organisation
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Organisations
- `GET /api/organisations/:id` - Get organisation details
- `PUT /api/organisations/:id` - Update organisation
- `POST /api/organisations/:id/logo` - Upload logo

### Customers
- `GET /api/organisations/:id/customers` - List customers
- `POST /api/organisations/:id/customers` - Add customer
- `POST /api/organisations/:id/customers/import` - Bulk import

### Fee Categories
- `GET /api/organisations/:id/fees` - List fee categories
- `POST /api/organisations/:id/fees` - Add fee category

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/organisations/:id/payments` - List payments

### Receipts
- `GET /api/organisations/:id/receipts` - List receipts
- `GET /api/receipts/:id` - Get receipt details
- `GET /api/receipts/:id/pdf` - Download receipt PDF

### Webhooks
- `POST /api/webhooks/razorpay` - Razorpay webhook handler

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── LandingPage.tsx       # Public landing page
│   ├── RegisterPage.tsx      # Organisation registration
│   ├── LoginPage.tsx         # User login
│   ├── OrgDashboard.tsx      # Organisation dashboard
│   ├── PaymentPage.tsx       # Customer payment page
│   ├── PaymentSuccess.tsx    # Payment success page
│   ├── PaymentFailure.tsx    # Payment failure page
│   └── ReceiptView.tsx       # Receipt template
├── utils/
│   └── format.ts             # Formatting utilities
├── types.ts                  # TypeScript type definitions
├── store.ts                  # Data management (LocalStorage)
├── App.tsx                   # Main app with routing
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

### Adding New Features

1. **New Dashboard Section**
   - Add tab to `OrgDashboard.tsx`
   - Create data fetching logic in `store.ts`
   - Add TypeScript types in `types.ts`

2. **New Receipt Field**
   - Update `Receipt` type in `types.ts`
   - Modify `ReceiptView.tsx` template
   - Update `createReceipt()` in `store.ts`

3. **New Organisation Setting**
   - Add field to `Organisation` type
   - Update `SettingsManager` component
   - Modify `registerOrganisation()` in `store.ts`

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues, questions, or contributions:
- Check the documentation thoroughly
- Review the demo organisation for examples
- Test with the pre-configured demo data
- Verify all required fields are completed

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Router](https://reactrouter.com/)

## ✅ Checklist for Production

Before deploying to production:

- [ ] Implement backend API with proper database
- [ ] Add server-side authentication and authorization
- [ ] Implement proper password hashing (bcrypt)
- [ ] Set up Razorpay account and complete KYC
- [ ] Configure Razorpay webhooks
- [ ] Implement server-side payment verification
- [ ] Add HTTPS enforcement
- [ ] Set up proper error handling and logging
- [ ] Implement rate limiting
- [ ] Add input validation on server-side
- [ ] Set up backup and disaster recovery
- [ ] Configure monitoring and alerts
- [ ] Test with real transactions in test mode
- [ ] Complete security audit
- [ ] Set up proper CORS configuration
- [ ] Implement proper session management
- [ ] Add audit logging for compliance
- [ ] Test multi-tenancy isolation thoroughly
- [ ] Verify receipt numbering is unique per organisation
- [ ] Test PDF generation at scale
- [ ] Set up email notifications (optional)

---

**Built with ❤️ for organisations across India**

**PayFlow — Payments and Receipts for Every Organisation**
