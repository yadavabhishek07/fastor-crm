import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PublicEnquiryForm from './components/PublicEnquiryForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PublicLeadsView from './components/PublicLeadsView';
import MyLeadsView from './components/MyLeadsView';
import { Inbox, Briefcase, Share2, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

function CRMContent({ activeView, setActiveView }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('public'); // 'public', 'mine', or 'share'
  const [copied, setCopied] = useState(false);

  if (activeView === 'public-form') {
    return <PublicEnquiryForm />;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Employee & Counselor CRM Access</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Fastor Counselor Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your company credentials or create a new counselor account to view and claim prospective client leads.
          </p>
        </div>

        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  const shareableUrl = window.location.origin + '?view=public-form';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Counselor Welcome & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as counselor: <span className="font-semibold text-slate-700">{user.email}</span>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'public'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Public Pool (Unclaimed)</span>
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'mine'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>My Claimed Leads</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'share'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Circulate Form</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'public' && (
        <PublicLeadsView onLeadClaimed={() => setActiveTab('mine')} />
      )}

      {activeTab === 'mine' && <MyLeadsView />}

      {activeTab === 'share' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
            <Share2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Share Client Enquiry Form</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Per specification: This form can be circulated online or shared directly by the counselor during student phone calls.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="bg-transparent flex-1 text-xs text-slate-700 outline-none font-mono px-2"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs">
            <button
              onClick={() => setActiveView('public-form')}
              className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center space-x-1"
            >
              <span>Preview Public Form in this browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'public-form' ? 'public-form' : 'crm';
  });

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
        <div>
          <Navbar activeView={activeView} setActiveView={setActiveView} />
          <main>
            <CRMContent activeView={activeView} setActiveView={setActiveView} />
          </main>
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Fastor CRM System — Node.js & React Developer Assessment</span>
            <div className="flex items-center space-x-4">
              <a
                href="http://localhost:5000/api-docs"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-600 transition"
              >
                Swagger API Docs
              </a>
              <a
                href="http://localhost:5000/health"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-600 transition"
              >
                API Health Check
              </a>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
