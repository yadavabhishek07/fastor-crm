import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LeadCard from './LeadCard';
import { RefreshCw, Search, Filter, Inbox, AlertTriangle } from 'lucide-react';

export default function PublicLeadsView({ onLeadClaimed }) {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [conflictMessage, setConflictMessage] = useState(null);

  const fetchPublicLeads = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setConflictMessage(null);

    try {
      const params = {};
      if (search) params.search = search;
      if (courseFilter) params.course = courseFilter;

      const res = await api.enquiries.getPublic(params);
      if (res.success) {
        setLeads(res.enquiries || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load public leads:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublicLeads();
  }, [search, courseFilter]);

  const handleClaim = async (leadId) => {
    setClaimingId(leadId);
    setConflictMessage(null);

    try {
      const res = await api.enquiries.claim(leadId);
      if (res.success) {
        // Optimistically remove from public list
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        setTotal((prev) => Math.max(0, prev - 1));
        if (onLeadClaimed) onLeadClaimed(res.enquiry);
      }
    } catch (err) {
      if (err.status === 409) {
        setConflictMessage(
          err.data?.message || 'Race condition: This lead was just claimed by another counselor!'
        );
        // Refresh list to update state
        fetchPublicLeads();
      } else {
        alert(err.message || 'Failed to claim lead');
      }
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Explainer */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-md shadow-orange-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
            Public Lead Pool (Unclaimed)
          </span>
          <h2 className="text-2xl font-bold">Available Prospective Students ({total})</h2>
          <p className="text-orange-100 text-sm mt-1 max-w-xl">
            These enquiries were submitted by prospective clients and are visible to all counselors. Claiming a lead assigns it exclusively to your account and removes it from the public view.
          </p>
        </div>

        <button
          onClick={() => fetchPublicLeads(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-orange-700 font-semibold text-sm shadow hover:bg-orange-50 transition flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Pool</span>
        </button>
      </div>

      {/* Conflict / Race condition alert */}
      {conflictMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center space-x-3 text-sm shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Notice:</span> {conflictMessage}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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

      {/* Lead Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-2" />
          <p className="text-sm font-medium">Loading unclaimed leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Unclaimed Leads Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All submitted enquiries have either been claimed by counselors or none match your search filter. Submit a new enquiry using the public form to test!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              isClaimedView={false}
              onClaim={handleClaim}
              claiming={claimingId === lead._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
