import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut, UserCircle, Globe, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeView, setActiveView }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('crm')}>
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Fastor<span className="text-orange-600">CRM</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Counselor Lead Portal
            </span>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView('public-form')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'public-form'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Client Enquiry Form</span>
          </button>

          <button
            onClick={() => setActiveView('crm')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'crm'
                ? 'bg-orange-50 text-orange-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Counselor CRM</span>
          </button>
        </nav>

        {/* User Status / Action */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <UserCircle className="w-4 h-4" />
              <span>Not logged in</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
