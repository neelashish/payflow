# How to Get and Run the PayFlow Project

## Quick Start Guide

### Option 1: Download All Files (Recommended)

Since this is a web-based environment, here's how to get all the code:

#### Step 1: Create a new folder on your computer
```bash
mkdir payflow-project
cd payflow-project
```

#### Step 2: Copy each file from this project

You'll need to copy all the files listed below. For each file:
1. Open the file in this environment
2. Copy all the content
3. Create the same file structure on your computer
4. Paste the content

#### Complete File List:

**Root files:**
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.js`
- `README.md`
- `IMPLEMENTATION.md`
- `GETTING_STARTED.md` (this file)

**Source files (in `src/` folder):**
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/store.ts`
- `src/types.ts`
- `src/utils/format.ts`

**Component files (in `src/components/` folder):**
- `src/components/LandingPage.tsx`
- `src/components/LoginPage.tsx`
- `src/components/RegisterPage.tsx`
- `src/components/OrgDashboard.tsx`
- `src/components/PaymentPage.tsx`
- `src/components/PaymentSuccess.tsx`
- `src/components/PaymentFailure.tsx`
- `src/components/DemoPage.tsx`
- `src/components/ReceiptView.tsx`

#### Step 3: Install dependencies
```bash
npm install
```

#### Step 4: Run the project
```bash
npm run dev
```

The app will open at `http://localhost:3000` (or similar port)

---

### Option 2: Use Git (If you have access to a repository)

If this project is in a Git repository:
```bash
git clone <repository-url>
cd payflow-project
npm install
npm run dev
```

---

### Option 3: Automated Script (Advanced)

Create a file called `download-all.sh` (Mac/Linux) or `download-all.bat` (Windows) that reads each file.

**For Mac/Linux (download-all.sh):**
```bash
#!/bin/bash

# This script helps you understand the file structure
echo "PayFlow Project Files:"
echo "======================"
find src -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | sort
echo ""
echo "Root files:"
ls -1 *.html *.json *.js *.md 2>/dev/null
```

---

## Project Structure

```
payflow-project/
├── index.html                 # Main HTML file
├── package.json               # Dependencies
├── package-lock.json          # Locked dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.js             # Vite bundler config
├── README.md                  # Project documentation
├── IMPLEMENTATION.md          # Implementation details
├── GETTING_STARTED.md         # This file
└── src/
    ├── main.tsx               # Entry point
    ├── App.tsx                # Main app with routing
    ├── index.css              # Global styles
    ├── store.ts               # Data management
    ├── types.ts               # TypeScript types
    ├── utils/
    │   └── format.ts          # Formatting utilities
    └── components/
        ├── LandingPage.tsx    # Modern landing page
        ├── LoginPage.tsx      # User login
        ├── RegisterPage.tsx   # Organisation registration
        ├── OrgDashboard.tsx   # Organisation dashboard
        ├── PaymentPage.tsx    # Payment form
        ├── PaymentSuccess.tsx # Success page
        ├── PaymentFailure.tsx # Failure page
        ├── DemoPage.tsx       # Interactive demo
        └── ReceiptView.tsx    # Receipt template
```

---

## What Each File Does

### Core Files

**`index.html`**
- Main HTML entry point
- Loads Inter font from Google Fonts
- Includes Razorpay checkout script
- Sets up the root div for React

**`package.json`**
- Lists all dependencies (React, TypeScript, Tailwind, etc.)
- Defines scripts (dev, build, preview)

**`src/main.tsx`**
- React entry point
- Renders the App component

**`src/App.tsx`**
- Main application component
- Sets up routing with React Router
- Defines all routes (/, /login, /register, /dashboard, /demo, /pay, etc.)

### Data & Types

**`src/store.ts`**
- Data management layer (currently using localStorage)
- Functions for organisations, users, customers, payments, receipts
- Demo mode functions (isolated from real data)
- All CRUD operations

**`src/types.ts`**
- TypeScript type definitions
- Interfaces for Organisation, User, Customer, Payment, Receipt, etc.
- Payment status types
- Organisation types

**`src/utils/format.ts`**
- Currency formatting (₹ symbol, Indian numbering)
- Date formatting
- Amount in words conversion (Indian numbering system)

### Components

**`src/components/LandingPage.tsx`**
- Modern SaaS-style landing page
- Hero section with CTAs
- Features grid
- How it works section
- Demo CTA
- Responsive navigation

**`src/components/DemoPage.tsx`**
- Fully interactive demo mode
- Demo organisation: "Northstar Learning Centre"
- Sample payment requests (₹500, ₹2,000, ₹750)
- Simulated payment flow (success/failure/cancel)
- Demo receipt generation with PDF download
- Isolated demo data (doesn't affect real data)

**`src/components/LoginPage.tsx`**
- User authentication
- Email/password login
- Redirects to dashboard on success

**`src/components/RegisterPage.tsx`**
- Two-step registration process
- Step 1: Organisation details
- Step 2: Admin account creation
- Creates new organisation and user

**`src/components/OrgDashboard.tsx`**
- Organisation dashboard with sidebar navigation
- Overview with stats (total collected, successful, pending, failed)
- Payment link generator
- Transaction history
- Fee categories management
- Customer management
- Excel/CSV import
- Settings page
- Mobile-responsive with drawer navigation

**`src/components/PaymentPage.tsx`**
- Customer payment form
- Organisation-specific (uses org ID from URL)
- Fee category selection or custom amount
- Payment summary
- Integrates with Razorpay (or simulates in demo)

**`src/components/PaymentSuccess.tsx`**
- Payment success confirmation
- Receipt preview
- PDF download button
- Shows payment details

**`src/components/PaymentFailure.tsx`**
- Payment failure page
- Error message
- Retry option

**`src/components/ReceiptView.tsx`**
- A4 receipt template
- Dynamic content (organisation details, customer info, payment details)
- Amount in words
- Bank details
- Terms and conditions
- Print-ready layout

---

## Running the Project

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Open browser to see changes instantly

### Production Build
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Can be deployed to any static hosting (Vercel, Netlify, etc.)

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally

---

## Testing the Demo

1. Open the app in your browser
2. Click "Explore Interactive Demo" on the landing page
3. Or navigate directly to `/#/demo`
4. Try the payment flow:
   - Select a payment request
   - Enter customer details
   - Choose simulation outcome (Success/Failure/Cancel)
   - Download the demo receipt PDF

---

## Key Features Implemented

✅ Multi-organisation platform (not hardcoded to one school)
✅ Modern SaaS UI (light theme, professional design)
✅ Interactive demo mode (fully working, isolated data)
✅ Mobile-responsive design
✅ Organisation registration
✅ User authentication
✅ Dashboard with analytics
✅ Payment processing (simulated in demo, Razorpay-ready for production)
✅ Automatic receipt generation
✅ PDF download functionality
✅ Excel/CSV import
✅ Fee categories management
✅ Customer management
✅ Transaction tracking
✅ Amount in words (Indian numbering system)
✅ A4 receipt template
✅ Demo receipt clearly marked as "DEMO RECEIPT — NOT PROOF OF PAYMENT"

---

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas for PDF
- **PapaParse** - CSV parsing
- **XLSX** - Excel file handling
- **UUID** - Unique ID generation

---

## Next Steps

1. Copy all files to your local machine
2. Run `npm install`
3. Run `npm run dev`
4. Test the demo at `/#/demo`
5. Try registering a new organisation
6. Explore all features

---

## Need Help?

- Check `README.md` for comprehensive documentation
- Check `IMPLEMENTATION.md` for technical details
- All code is well-commented
- TypeScript provides type hints in your editor

---

## Important Notes

- **Demo Mode**: Completely isolated from real data
- **Real Payments**: Requires Razorpay configuration (not included in demo)
- **Data Storage**: Currently uses localStorage (easy to migrate to backend)
- **Security**: Demo mode is safe; production needs proper backend authentication
- **Receipts**: Demo receipts are clearly marked and cannot be confused with real receipts

---

**Enjoy your PayFlow project! 🚀**
