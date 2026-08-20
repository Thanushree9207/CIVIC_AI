import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { SLABadge } from '../components/SLABadge';
import {
  FilePlus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  MapPin,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface CitizenDashboardProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigate: (tab: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onSelectComplaint, onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/complaints/my', {
      headers: { Authorization: `Bearer ${user.id}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.complaints) setComplaints(data.complaints);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const safeComplaints = complaints || [];
  const pendingVerification = safeComplaints.filter(c => c.status === 'RESOLUTION_PENDING_VERIFICATION');
  const activeComplaints = safeComplaints.filter(c => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'].includes(c.status));
  const resolvedComplaints = safeComplaints.filter(c => c.status === 'VERIFIED' || c.status === 'CLOSED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#020617] text-slate-200 min-h-screen">
      {/* Welcome Hero Bento Banner */}
      <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Citizen Grievance & SLA Portal
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white mb-2">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Report civic issues directly with AI auto-categorization, precise department routing, countdown SLAs, and tamper-proof verification before closure.
          </p>

          <button
            onClick={() => onNavigate('submit-complaint')}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/50 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-emerald-300" />
            File a New Civic Grievance
          </button>
        </div>
      </div>

      {/* Action Required: Verification Gate Banner */}
      {pendingVerification.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              <h3 className="font-heading font-bold text-amber-300 text-sm sm:text-base">
                Action Required: {pendingVerification.length} Grievance(s) Resolved & Awaiting Your Confirmation
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-700/60">
              Gate Active
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            Under Civic AI rules, an officer cannot close a ticket unilaterally. Please inspect the submitted evidence and confirm or reopen the ticket.
          </p>

          <div className="space-y-2.5">
            {pendingVerification.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="bg-[#0f172a] p-4 rounded-xl border border-amber-800/50 hover:border-amber-500 flex items-center justify-between text-xs transition-all cursor-pointer shadow-md group"
              >
                <div>
                  <div className="font-bold text-white mb-0.5 group-hover:text-amber-300 transition-colors">{c.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    #{c.id} &bull; {c.departmentName} &bull; Officer: {c.assignedOfficerName}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                    Verify Resolution <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Bento Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Total Logged</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-white">{safeComplaints.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted grievances</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Active Field Work</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-amber-300">{activeComplaints.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under officer SLA timer</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-emerald-400">{resolvedComplaints.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Citizen verified fixes</p>
        </div>
      </div>

      {/* Grievance Ledger List */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="font-heading font-bold text-white text-lg">
            My Submitted Grievance Ledger
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {safeComplaints.length} Recorded Complaints
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            Loading your grievances from municipal node...
          </div>
        ) : safeComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <p className="text-sm">You have not submitted any complaints yet.</p>
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              File First Grievance
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {safeComplaints.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{c.id}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        c.priority === 'CRITICAL'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          : c.priority === 'HIGH'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : c.priority === 'MEDIUM'
                          ? 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.departmentName || 'General Works'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{c.locationAddress}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <SLABadge sla={c.sla} />
                  <span
                    className={`text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-xl border ${
                      c.status === 'VERIFIED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : c.status === 'RESOLUTION_PENDING_VERIFICATION'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/60 animate-pulse'
                        : c.status === 'ESCALATED'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
