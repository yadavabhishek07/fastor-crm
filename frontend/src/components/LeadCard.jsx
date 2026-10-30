import React from 'react';
import { User, Mail, Phone, BookOpen, Clock, Check, AlertCircle, Calendar } from 'lucide-react';

export default function LeadCard({
  lead,
  isClaimedView = false,
  onClaim,
  claiming = false
}) {
  const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedClaimedDate = lead.claimedAt
    ? new Date(lead.claimedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
      <div>
        {/* Header with Name & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{lead.name}</h3>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Submitted {formattedDate}</span>
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
              lead.status === 'claimed'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {lead.status === 'claimed' ? 'Private (Claimed)' : 'Public (Unclaimed)'}
          </span>
        </div>

        {/* Course badge */}
        <div className="mt-3.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
            <BookOpen className="w-3.5 h-3.5 text-orange-600" />
            <span>{lead.courseInterest}</span>
          </span>
        </div>

        {/* Contact info */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <a
              href={`mailto:${lead.email}`}
              className="text-slate-700 hover:text-orange-600 font-medium truncate"
            >
              {lead.email}
            </a>
          </div>

          {lead.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <a
                href={`tel:${lead.phone}`}
                className="text-slate-700 hover:text-orange-600 font-medium"
              >
                {lead.phone}
              </a>
            </div>
          )}
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="mt-3.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
            "{lead.notes}"
          </div>
        )}

        {/* Claimed metadata */}
        {isClaimedView && formattedClaimedDate && (
          <div className="mt-3 text-xs text-emerald-700 flex items-center space-x-1.5 font-medium bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assigned to you on {formattedClaimedDate}</span>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
          ID: {lead._id}
        </span>

        {!isClaimedView && (
          <button
            onClick={() => onClaim(lead._id)}
            disabled={claiming}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm hover:shadow transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            {claiming ? (
              <span>Claiming...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Claim Lead</span>
              </>
            )}
          </button>
        )}

        {isClaimedView && (
          <div className="flex items-center space-x-2">
            <a
              href={`mailto:${lead.email}?subject=Follow up regarding ${lead.courseInterest}`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
            >
              Email Client
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-xs transition"
              >
                Call
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
