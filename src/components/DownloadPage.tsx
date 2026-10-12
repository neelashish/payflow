import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function DownloadPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready' | 'downloading' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState('Loading project files...');
  const [files, setFiles] = useState<Record<string, string>>({});

  const FILE_PATHS = [
    'package.json',
    'index.html',
    'tsconfig.json',
    'tsconfig.app.json',
    'vite.config.ts',
    '.gitignore',
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/types.ts',
    'src/store.ts',
    'src/utils/format.ts',
    'src/components/LandingPage.tsx',
    'src/components/LoginPage.tsx',
    'src/components/RegisterPage.tsx',
    'src/components/OrgDashboard.tsx',
    'src/components/PaymentPage.tsx',
    'src/components/PaymentSuccess.tsx',
    'src/components/PaymentFailure.tsx',
    'src/components/DemoPage.tsx',
    'src/components/ReceiptView.tsx',
  ];

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const loaded: Record<string, string> = {};
    let loadedCount = 0;

    for (const path of FILE_PATHS) {
      try {
        const resp = await fetch('/' + path);
        if (resp.ok) {
          loaded[path] = await resp.text();
          loadedCount++;
        }
      } catch (e) {
        console.warn('Could not fetch:', path);
      }
    }

    // Add README
    loaded['README.md'] = `# PayFlow - Multi-Organisation Payment Platform

A modern, multi-organisation payment platform with interactive demo mode.

## Features
- Multi-organisation support
- Interactive demo mode at /#/demo
- Modern SaaS UI (light theme, professional design)
- Mobile responsive design
- Automatic receipt generation
- PDF download functionality
- Excel/CSV import
- Fee categories management
- Customer management
- Transaction tracking

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000 in your browser.

## Demo Mode

Visit \`/#/demo\` to try the interactive demo without any setup.

The demo includes:
- Sample organisation: "Northstar Learning Centre"
- 3 pending payment requests
- 4 historical transactions
- Full payment simulation (success/failure/cancel)
- Receipt PDF download

## Routes

- \`/\` - Landing page
- \`/#/demo\` - Interactive demo
- \`/#/login\` - Sign in
- \`/#/register\` - Register organisation
- \`/#/dashboard\` - Organisation dashboard
- \`/#/pay?org=<id>\` - Payment page
- \`/#/download\` - Download project

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v4
- Vite
- React Router (HashRouter)
- Lucide React icons
- jsPDF + html2canvas (PDF generation)
- PapaParse (CSV parsing)
- XLSX (Excel handling)
- UUID

## Project Structure

\`\`\`
src/
├── main.tsx              # Entry point
├── App.tsx               # Router setup
├── index.css             # Global styles + design system
├── types.ts              # TypeScript interfaces
├── store.ts              # Data management (localStorage)
├── utils/
│   └── format.ts         # Currency, date, amount-in-words
└── components/
    ├── LandingPage.tsx    # Modern SaaS landing page
    ├── LoginPage.tsx      # User authentication
    ├── RegisterPage.tsx   # Organisation registration
    ├── OrgDashboard.tsx   # Organisation management
    ├── PaymentPage.tsx    # Customer payment form
    ├── PaymentSuccess.tsx # Success + receipt preview
    ├── PaymentFailure.tsx # Failure page
    ├── DemoPage.tsx       # Interactive demo
    └── ReceiptView.tsx    # A4 receipt template
\`\`\`

## Configuration

Each organisation can configure:
- Name, logo, address, contact
- GSTIN and tax details
- Bank details
- Receipt prefix and template
- Fee categories
- Terms and conditions

## Notes

- Demo mode is completely isolated from real data
- Real Razorpay payments require proper configuration
- Data is stored in localStorage (for demo purposes)
- Receipts are generated as A4 PDFs
`;

    setFiles(loaded);

    if (loadedCount >= 5) {
      setStatus('ready');
      setMessage(`✅ ${loadedCount} files loaded. Click download to get the ZIP.`);
    } else {
      setStatus('error');
      setMessage(`⚠️ Could only load ${loadedCount} files. Make sure you're running the dev server.`);
    }
  }

  async function handleDownload() {
    setStatus('downloading');
    setMessage('Creating ZIP file...');

    try {
      const zip = new JSZip();

      for (const [path, content] of Object.entries(files)) {
        zip.file(path, content);
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      saveAs(blob, 'payflow-project.zip');

      setStatus('done');
      setMessage('✅ Download started! Check your downloads folder.');
    } catch (e: any) {
      setStatus('error');
      setMessage('❌ Error: ' + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-zinc-500 hover:text-zinc-900 mb-6 inline-flex items-center gap-1 transition"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">📦</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Download Project</h1>
            <p className="text-zinc-500 text-sm">Get the complete PayFlow project as a ZIP file</p>
          </div>

          <div className={`p-4 rounded-lg mb-6 text-sm text-center ${
            status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {status === 'loading' && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                {message}
              </div>
            )}
            {status !== 'loading' && message}
          </div>

          <button
            onClick={handleDownload}
            disabled={status === 'loading' || status === 'downloading'}
            className="w-full py-3 px-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'downloading' ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating ZIP...
              </span>
            ) : (
              '⬇️ Download payflow-project.zip'
            )}
          </button>

          <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs font-medium text-zinc-700 mb-2">After downloading:</p>
            <ol className="text-xs text-zinc-600 space-y-1 list-decimal list-inside">
              <li>Extract the ZIP file</li>
              <li>Open terminal in the folder</li>
              <li>Run <code className="bg-zinc-200 px-1 rounded">npm install</code></li>
              <li>Run <code className="bg-zinc-200 px-1 rounded">npm run dev</code></li>
              <li>Open <code className="bg-zinc-200 px-1 rounded">http://localhost:3000</code></li>
            </ol>
          </div>

          <div className="mt-4 text-xs text-zinc-400 text-center">
            {Object.keys(files).length} files included in the ZIP
          </div>
        </div>
      </div>
    </div>
  );
}
