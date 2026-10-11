import { useNavigate } from 'react-router-dom';
import { getPlatformName, getPlatformTagline, seedDemoOrganisation, setCurrentOrganisation, setCurrentUser } from '../store';

export default function LandingPage() {
  const navigate = useNavigate();
  const platformName = getPlatformName();
  const tagline = getPlatformTagline();

  const handleDemo = () => {
    const { organisation, user } = seedDemoOrganisation();
    setCurrentOrganisation(organisation.id);
    setCurrentUser(user.id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{platformName}</h1>
              <p className="text-xs text-slate-400">{tagline}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDemo}
              className="px-4 py-2 text-slate-300 hover:text-white transition text-sm"
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-slate-300 hover:text-white transition text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Register Organisation
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Collect Payments.<br />
            Generate Receipts.<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Manage Everything in One Place.
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The universal payment platform for schools, colleges, NGOs, businesses, and every organisation in India. 
            Accept online payments, generate professional receipts automatically, and manage transactions effortlessly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition shadow-lg shadow-blue-500/25"
            >
              <i className="fas fa-rocket mr-2"></i>
              Register Your Organisation
            </button>
            <button
              onClick={handleDemo}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-lg transition"
            >
              <i className="fas fa-play-circle mr-2"></i>
              Try Live Demo
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required • Free to try • Setup in minutes
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: 'fa-credit-card', title: 'Online Payments', desc: 'Accept payments via UPI, cards, net banking, and wallets through Razorpay' },
            { icon: 'fa-file-invoice', title: 'Automatic Receipts', desc: 'Generate professional A4 receipts automatically after every successful payment' },
            { icon: 'fa-chart-line', title: 'Transaction Tracking', desc: 'Monitor all payments, receipts, and refunds in real-time with detailed reports' },
            { icon: 'fa-file-excel', title: 'Excel Import', desc: 'Bulk import customers, students, or members from Excel/CSV files' },
            { icon: 'fa-building', title: 'Multi-Organisation', desc: 'Each organisation has its own isolated workspace, branding, and configuration' },
            { icon: 'fa-shield-alt', title: 'Secure & Compliant', desc: 'Bank-grade security, server-side verification, and proper audit trails' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <i className={`fas ${feature.icon} text-xl text-blue-400`}></i>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Built for Every Organisation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'fa-school', label: 'Schools' },
            { icon: 'fa-university', label: 'Colleges' },
            { icon: 'fa-chalkboard-teacher', label: 'Coaching' },
            { icon: 'fa-hands-helping', label: 'NGOs' },
            { icon: 'fa-users', label: 'Clubs' },
            { icon: 'fa-hospital', label: 'Healthcare' },
            { icon: 'fa-store', label: 'Businesses' },
            { icon: 'fa-briefcase', label: 'Services' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-center hover:bg-slate-800/50 transition">
              <i className={`fas ${item.icon} text-2xl text-blue-400 mb-2`}></i>
              <p className="text-slate-300 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: 'fa-building', title: 'Register', desc: 'Create your organisation account with your details' },
            { step: '2', icon: 'fa-cog', title: 'Configure', desc: 'Set up fee categories, receipt template, and branding' },
            { step: '3', icon: 'fa-link', title: 'Share', desc: 'Share your payment link with customers or students' },
            { step: '4', icon: 'fa-file-invoice', title: 'Receipt', desc: 'Professional receipts are generated automatically' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-700 flex items-center justify-center">
                  <i className={`fas ${item.icon} text-xl text-blue-400`}></i>
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">{item.step}</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-slate-300 mb-8">
            Join hundreds of organisations already using {platformName} to collect payments and manage receipts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition shadow-lg shadow-blue-500/25"
            >
              Create Your Organisation Account
            </button>
            <button
              onClick={handleDemo}
              className="px-8 py-4 border border-blue-500 hover:bg-blue-900/30 text-blue-300 rounded-lg font-bold text-lg transition"
            >
              <i className="fas fa-play-circle mr-2"></i>Try Demo First
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 {platformName}. All rights reserved. | Powered by Razorpay
          </p>
        </div>
      </footer>
    </div>
  );
}
