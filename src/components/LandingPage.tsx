import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CreditCard, 
  FileText, 
  Building2, 
  LineChart, 
  FileSpreadsheet, 
  Download,
  Menu,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { getPlatformName } from '../store';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const platformName = getPlatformName();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-zinc-200/60' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 font-semibold text-lg text-zinc-900"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              {platformName}
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => scrollToSection('features')} className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition">How It Works</button>
              <button onClick={() => navigate('/login')} className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 transition">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn-primary text-sm">Get Started</button>
              <button onClick={() => navigate('/demo')} className="btn-secondary text-sm ml-2">
                <Sparkles className="w-3.5 h-3.5" />
                Try Demo
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-zinc-100 animate-fade-in">
              <div className="flex flex-col gap-1">
                <button onClick={() => scrollToSection('features')} className="w-full text-left px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="w-full text-left px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md">How It Works</button>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md">Sign In</button>
                <div className="flex gap-2 mt-2 px-1">
                  <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="flex-1 btn-primary text-sm">Get Started</button>
                  <button onClick={() => { navigate('/demo'); setMobileMenuOpen(false); }} className="flex-1 btn-secondary text-sm">Try Demo</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now in public beta
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.1] mb-6 text-balance">
              Payments, receipts, and everything in between.
            </h1>

            {/* Supporting text */}
            <p className="text-lg md:text-xl text-zinc-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              One simple platform for organisations to collect payments, track transactions, and generate professional receipts automatically.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary w-full sm:w-auto px-6 py-3 text-base"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/demo')}
                className="btn-secondary w-full sm:w-auto px-6 py-3 text-base"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Explore Interactive Demo
              </button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-zinc-500">
              Built for schools, colleges, businesses, clubs, and growing organisations.
            </p>
          </div>

          {/* Product Preview */}
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-sm mx-auto px-3 py-1 rounded-md bg-white border border-zinc-200 text-xs text-zinc-500 text-center">
                    payflow.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="p-4 sm:p-6 bg-zinc-50/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <StatPreview label="Total Collected" value="₹24,500" trend="+12%" />
                  <StatPreview label="Successful" value="18" trend="+3" />
                  <StatPreview label="Pending" value="3" trend="" />
                  <StatPreview label="Receipts" value="18" trend="+3" />
                </div>
                <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900">Recent Transactions</span>
                    <span className="text-xs text-zinc-500 hidden sm:inline">Last 7 days</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {[
                      { name: 'Aarav Sharma', desc: 'Tuition Fee', amount: '₹2,000', status: 'paid' },
                      { name: 'Priya Patel', desc: 'Lab Fees', amount: '₹850', status: 'paid' },
                      { name: 'Rohan Gupta', desc: 'Course Registration', amount: '₹500', status: 'pending' },
                    ].map((tx, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-zinc-600">{tx.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">{tx.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{tx.desc}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-zinc-900">{tx.amount}</p>
                          <span className={`text-xs ${tx.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {tx.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo label */}
              <div className="absolute top-16 right-4 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                Demo Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
              Everything you need to manage payments
            </h2>
            <p className="text-lg text-zinc-600">
              A complete toolkit for organisations to collect payments and generate professional receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CreditCard, title: 'Online Payment Collection', desc: 'Accept payments via UPI, cards, net banking, and wallets through Razorpay integration.' },
              { icon: FileText, title: 'Automatic PDF Receipts', desc: 'Professional A4 receipts generated automatically after every successful payment.' },
              { icon: Building2, title: 'Multi-Organisation Support', desc: 'Each organisation has its own workspace, branding, and isolated configuration.' },
              { icon: LineChart, title: 'Transaction Tracking', desc: 'Monitor all payments, receipts, and refunds in real-time with detailed reports.' },
              { icon: FileSpreadsheet, title: 'Excel and CSV Import', desc: 'Bulk import customers, students, or members from spreadsheet files.' },
              { icon: Download, title: 'Reports and Exports', desc: 'Download transaction records and generate reports for accounting and compliance.' },
            ].map((feature, i) => (
              <div key={i} className="card card-hover">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-zinc-50/50 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
              Get started in three simple steps
            </h2>
            <p className="text-lg text-zinc-600">
              From registration to receipt generation — the entire process takes just minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Create your workspace', desc: 'Register your organisation and configure your profile, branding, and receipt template.' },
              { step: '02', title: 'Set up and collect', desc: 'Define fee categories, share your payment link, and start collecting payments from customers.' },
              { step: '03', title: 'Track and generate', desc: 'Monitor transactions in real-time and download professional receipts automatically.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-zinc-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-lg bg-indigo-50 border border-indigo-100 max-w-2xl mx-auto">
            <p className="text-sm text-indigo-900 text-center">
              <strong>Note:</strong> Real Razorpay payments require appropriate provider configuration and KYC. The interactive demo works without any payment credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20 md:py-28 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
              See how it works before you sign up.
            </h2>
            <p className="text-lg text-zinc-600 mb-8">
              Explore a complete sample payment journey, from payment request to confirmation and downloadable receipt.
            </p>
            <button
              onClick={() => navigate('/demo')}
              className="btn-accent px-8 py-3.5 text-base"
            >
              <Sparkles className="w-4 h-4" />
              Launch Interactive Demo
            </button>
            <p className="mt-4 text-sm text-zinc-500">
              No account required • No payment credentials needed • Works instantly
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="font-semibold text-zinc-900">{platformName}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button onClick={() => scrollToSection('features')} className="text-zinc-600 hover:text-zinc-900 transition">Features</button>
              <button onClick={() => navigate('/login')} className="text-zinc-600 hover:text-zinc-900 transition">Sign In</button>
              <button onClick={() => navigate('/register')} className="text-zinc-600 hover:text-zinc-900 transition">Get Started</button>
              <button onClick={() => navigate('/demo')} className="text-zinc-600 hover:text-zinc-900 transition">Try Demo</button>
            </div>

            <p className="text-sm text-zinc-500">
              © 2026 {platformName}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatPreview({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-3 sm:p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-lg sm:text-xl font-semibold text-zinc-900">{value}</p>
        {trend && <span className="text-xs text-emerald-600 font-medium">{trend}</span>}
      </div>
    </div>
  );
}
