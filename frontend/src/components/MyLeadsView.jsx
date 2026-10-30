import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LeadCard from './LeadCard';
import { RefreshCw, Search, ShieldCheck, FolderLock } from 'lucide-react';

export default function MyLeadsView() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const fetchMyLeads = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (courseFilter) params.course = courseFilter;

      const res = await api.enquiries.getMine(params);
      if (res.success) {
        setLeads(res.enquiries || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load my claimed leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyLeads();
  }, [search, courseFilter]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-md shadow-emerald-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
            Private Counselor Leads
          </span>
          <h2 className="text-2xl font-bold">My Claimed Leads ({total})</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            These enquiries have been claimed by your account. They are private to you and completely hidden from other employees across the company.
          </p>
        </div>

        <button
          onClick={() => fetchMyLeads(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-sm shadow hover:bg-emerald-50 transition flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search my leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Courses</option>
            <option value="Full Stack">Full Stack Web Development</option>
            <option value="Backend">Backend Engineering</option>
            <option value="Frontend">Frontend Architecture</option>
            <option value="Cloud">Cloud DevOps</option>
            <option value="Data Science">Data Science & AI</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-sm font-medium">Loading your claimed leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">You haven't claimed any leads yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Switch to the "Public Pool" tab to discover prospective students and claim them into your personal counseling pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} isClaimedView={true} />
          ))}
        </div>
      )}
    </div>
  );
}
