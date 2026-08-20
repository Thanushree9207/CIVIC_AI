import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, AuditLog, PriorityLevel, SeverityLevel, RiskLevel } from '../types';
import { MapComponent } from '../components/MapComponent';
import { SLABadge } from '../components/SLABadge';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { AuditTimeline } from '../components/AuditTimeline';
import { ResolutionEvidenceModal } from '../components/ResolutionEvidenceModal';
import { VerificationModal } from '../components/VerificationModal';
import { SimilarComplaintsModal } from '../components/SimilarComplaintsModal';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Sparkles,
  MapPin,
  Camera,
  Layers,
  CopyCheck,
  ShieldCheck,
  RotateCcw,
  Send,
  UserCheck,
  Phone,
  Mail,
  ShieldAlert,
  Scale
} from 'lucide-react';

interface ComplaintDetailPageProps {
  complaintId: string;
  onBack: () => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({ complaintId, onBack }) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const fetchDetails = () => {
    if (!complaintId) return;
    setLoading(true);
    fetch(`/api/complaints/${complaintId}`, {
      headers: { Authorization: `Bearer ${user?.id || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.complaint) {
          setComplaint(data.complaint);
          setAuditLogs(data.auditLogs || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
    const timer = setInterval(fetchDetails, 10000);
    return () => clearInterval(timer);
  }, [complaintId, user]);

  const handleStatusChange = async (newStatus: string, note?: string) => {
    if (!complaint) return;
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || ''}`
        },
        body: JSON.stringify({ status: newStatus, note })
      });
      if (res.ok) fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (data: {
    category: string;
    severity: SeverityLevel;
    risk: RiskLevel;
    priority: PriorityLevel;
    overrideReason: string;
  }) => {
    if (!complaint) return;
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || ''}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolutionSubmit = async (data: {
    description: string;
    actionTaken: string;
    evidenceUrl?: string;
  }) => {
    if (!complaint) return;
    const res = await fetch(`/api/complaints/${complaint.id}/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.id || ''}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) fetchDetails();
  };

  const handleConfirmResolved = async (feedback: string) => {
    if (!complaint) return;
    const res = await fetch(`/api/complaints/${complaint.id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.id || ''}`
      },
      body: JSON.stringify({ feedback })
    });
    if (res.ok) fetchDetails();
  };

  const handleReopen = async (reopenReason: string, reopenEvidenceUrl?: string) => {
    if (!complaint) return;
    const res = await fetch(`/api/complaints/${complaint.id}/reopen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.id || ''}`
      },
      body: JSON.stringify({ reopenReason, reopenEvidenceUrl })
    });
    if (res.ok) fetchDetails();
  };

  if (loading && !complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm bg-[#020617] min-h-screen">
        Loading complaint dossier and audit trail...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-sm bg-[#020617] min-h-screen">
        Complaint not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#020617] text-slate-200 min-h-screen">
      {/* Top Bar with Back button and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#0f172a] px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-slate-400">ID: #{complaint.id}</span>
          <span
            className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border ${
              complaint.priority === 'CRITICAL'
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                : complaint.priority === 'HIGH'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : complaint.priority === 'MEDIUM'
                ? 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
            }`}
          >
            {complaint.priority} PRIORITY
          </span>
          <SLABadge sla={complaint.sla} />
        </div>
      </div>

      {/* Hero Header Banner (Bento Tile) */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {complaint.departmentName || 'Public Works'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Filed on {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {complaint.isDuplicateFlagged && (
                <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-700/60">
                  ⚠️ Semantic Duplicate Match
                </span>
              )}
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              {complaint.title}
            </h1>
          </div>

          {/* Current Status Pill */}
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Current State</span>
            <span
              className={`inline-block px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold tracking-wide uppercase border shadow-sm ${
                complaint.status === 'VERIFIED'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : complaint.status === 'RESOLUTION_PENDING_VERIFICATION'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-700/60 animate-pulse'
                  : complaint.status === 'ESCALATED'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                  : complaint.status === 'IN_PROGRESS'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {complaint.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Priority Reason Explanation */}
        <div className="p-3.5 bg-[#1e293b]/70 rounded-xl border border-slate-700/60 text-xs text-slate-300 mb-4 flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Rule Engine Priority Rationale: </span>
            <span className="text-slate-300 font-sans">{complaint.priorityReason}</span>
          </div>
        </div>

        {/* Citizen & Location Metadata Bento Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Citizen Information
            </span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {complaint.citizenName}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Phone: {complaint.citizenPhone} {user?.role === 'OFFICER' && <span className="text-[10px] text-amber-400 font-semibold">(Masked for Privacy)</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Location Landmark
            </span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {complaint.locationAddress}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
              GPS: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Assigned Field Officer
            </span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              {complaint.assignedOfficerName || 'Pending Assignment'}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Dept: {complaint.departmentName || 'General'}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Action Banners */}
      {/* 1. Citizen Verification Banner */}
      {complaint.status === 'RESOLUTION_PENDING_VERIFICATION' && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border border-blue-700/60 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-base mb-1 text-blue-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Officer Submitted Ground Resolution! Verification Required.
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              The assigned officer has completed work on-site and submitted photographic proof. Please confirm whether the grievance is genuinely fixed to close the ticket.
            </p>
          </div>
          <button
            onClick={() => setShowVerificationModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            Review & Verify Resolution
          </button>
        </div>
      )}

      {/* 2. Officer In-Progress & Action Bar */}
      {(user?.role === 'OFFICER' || user?.role === 'ADMIN') && (
        <div className="bg-[#0f172a] text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">Officer Control Deck</span>
            <p className="text-xs text-slate-400">
              Manage field lifecycle status and record on-site technical resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {complaint.status === 'ASSIGNED' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS', 'Officer commenced field inspection.')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                Start Field Work (In Progress)
              </button>
            )}

            {['ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'].includes(complaint.status) && (
              <button
                onClick={() => setShowResolutionModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Resolution & Evidence
              </button>
            )}

            {complaint.status === 'RESOLUTION_PENDING_VERIFICATION' && (
              <span className="text-xs text-blue-300 font-semibold bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-700/60 font-mono">
                Awaiting Citizen Verification Gate
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Details, AI, Similar, Map, Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Grievance Content & AI Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Full Description & Citizen Photo */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="font-heading font-bold text-white text-base">
              Citizen Description & On-Site Context
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#1e293b]/70 p-4 rounded-xl border border-slate-700/50 font-sans">
              {complaint.description}
            </p>

            {complaint.imageUrl && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  Citizen Attached Photographic Evidence:
                </span>
                <img
                  src={complaint.imageUrl}
                  alt="Citizen evidence"
                  className="w-full max-h-72 object-cover rounded-xl border border-slate-700 shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* AI Structured Intelligence Output Card */}
          <AIAnalysisCard
            analysis={complaint.aiAnalysis}
            complaintId={complaint.id}
            userRole={user?.role}
            onReviewSubmit={handleReviewSubmit}
          />

          {/* Historical Recommendation & Duplicate Detection Card */}
          <SimilarComplaintsModal
            similarComplaints={complaint.similarComplaints}
            historicalRecommendation={complaint.historicalRecommendation}
            isDuplicateFlagged={complaint.isDuplicateFlagged}
          />

          {/* Officer Resolution Details (If submitted) */}
          {complaint.resolution && (
            <div className="bg-[#0f172a] rounded-2xl border border-emerald-800/60 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/40">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-heading">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Submitted Field Resolution Dossier
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(complaint.resolution.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-300">Action Taken: </span>
                  <span className="text-white font-medium">{complaint.resolution.actionTaken}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-300">Technical Report: </span>
                  <span className="text-slate-300 italic">{complaint.resolution.description}</span>
                </div>
                {complaint.resolution.evidenceUrl && (
                  <div>
                    <span className="font-bold text-slate-300 block mb-1">Officer Proof Photo (After Repair):</span>
                    <img
                      src={complaint.resolution.evidenceUrl}
                      alt="Officer Proof"
                      className="w-full max-h-64 object-cover rounded-xl border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Citizen Verification Details (If verified or reopened) */}
          {complaint.verification && (
            <div
              className={`rounded-2xl border p-5 shadow-xl space-y-2 text-xs ${
                complaint.verification.isSatisfied
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : 'bg-rose-950/30 border-rose-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    complaint.verification.isSatisfied ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {complaint.verification.isSatisfied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                  )}
                  {complaint.verification.isSatisfied
                    ? 'Citizen Verified & Satisfied (Closed)'
                    : 'Citizen Reported Issue Persists (Reopened)'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(complaint.verification.verifiedAt).toLocaleDateString()}
                </span>
              </div>

              {complaint.verification.feedback && (
                <p className="text-slate-300 italic">"{complaint.verification.feedback}"</p>
              )}

              {complaint.verification.reopenReason && (
                <div className="mt-1 bg-[#1e293b] p-3 rounded-xl border border-rose-700/60 text-rose-200 font-medium">
                  <span className="font-bold block text-rose-300">Reopen Reason:</span>
                  {complaint.verification.reopenReason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 5 cols: Map & Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map Location */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-white text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Grievance Site Coordinates
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
              </span>
            </div>
            <MapComponent
              mode="single"
              latitude={complaint.latitude}
              longitude={complaint.longitude}
              selectedLocationName={complaint.locationAddress}
              height="240px"
            />
          </div>

          {/* Audit Timeline */}
          <AuditTimeline logs={auditLogs} />
        </div>
      </div>

      {/* Modals */}
      {showResolutionModal && (
        <ResolutionEvidenceModal
          complaintId={complaint.id}
          complaintTitle={complaint.title}
          onClose={() => setShowResolutionModal(false)}
          onSubmitResolution={handleResolutionSubmit}
        />
      )}

      {showVerificationModal && (
        <VerificationModal
          complaintId={complaint.id}
          complaintTitle={complaint.title}
          resolution={complaint.resolution}
          onClose={() => setShowVerificationModal(false)}
          onConfirmResolved={handleConfirmResolved}
          onReopen={handleReopen}
        />
      )}
    </div>
  );
};
