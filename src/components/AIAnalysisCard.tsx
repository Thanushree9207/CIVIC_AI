import React, { useState } from 'react';
import { AIAnalysis, PriorityLevel, SeverityLevel, RiskLevel } from '../types';
import { Sparkles, Edit3, CheckCircle2, ShieldCheck, AlertCircle, Cpu, UserCheck } from 'lucide-react';

interface AIAnalysisCardProps {
  analysis?: AIAnalysis;
  complaintId: string;
  userRole?: string;
  onReviewSubmit?: (data: {
    category: string;
    severity: SeverityLevel;
    risk: RiskLevel;
    priority: PriorityLevel;
    overrideReason: string;
  }) => Promise<void>;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  complaintId,
  userRole,
  onReviewSubmit
}) => {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [category, setCategory] = useState(analysis?.category || 'Roads & Infrastructure');
  const [severity, setSeverity] = useState<SeverityLevel>(analysis?.severity || 'MEDIUM');
  const [risk, setRisk] = useState<RiskLevel>(analysis?.risk || 'MEDIUM');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!analysis) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-center text-slate-400 text-xs font-mono">
        AI Analysis in queue or pending background worker.
      </div>
    );
  }

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReviewSubmit) return;
    setIsSubmitting(true);
    try {
      await onReviewSubmit({
        category,
        severity,
        risk,
        priority,
        overrideReason: overrideReason || 'Manual officer classification review'
      });
      setShowOverrideModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-white text-base">
                AI Grievance Intelligence
              </h3>
              <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                {analysis.modelName || 'gemini-3.7-flash'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Validated structured extraction with strict schema enforcement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis.isHumanOverridden ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-700/60">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Human Calibrated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {(analysis.confidence * 100).toFixed(0)}% Confidence
            </span>
          )}

          {(userRole === 'OFFICER' || userRole === 'ADMIN') && onReviewSubmit && (
            <button
              onClick={() => setShowOverrideModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Human-in-the-Loop review"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              Review / Override
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid of Extracted Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#1e293b]/70 p-3 rounded-xl border border-slate-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">AI Category</span>
          <span className="text-xs font-bold text-white mt-0.5 block line-clamp-1">{analysis.category}</span>
        </div>

        <div className="bg-[#1e293b]/70 p-3 rounded-xl border border-slate-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Severity</span>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border mt-0.5 ${getSeverityBadge(analysis.severity)}`}>
            {analysis.severity}
          </span>
        </div>

        <div className="bg-[#1e293b]/70 p-3 rounded-xl border border-slate-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Risk Evaluation</span>
          <span className="text-xs font-bold text-white mt-0.5 block">
            {analysis.risk === 'HIGH' ? '⚠️ High Hazard' : analysis.risk === 'MEDIUM' ? '⚡ Moderate Risk' : '🟢 Low Risk'}
          </span>
        </div>

        <div className="bg-[#1e293b]/70 p-3 rounded-xl border border-slate-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Persistence</span>
          <span className="text-xs font-bold text-white mt-0.5 block font-mono">~{analysis.duration_days} Days Active</span>
        </div>
      </div>

      {/* Context Details */}
      <div className="space-y-2 bg-[#1e293b]/40 rounded-xl p-3.5 border border-slate-700/40 text-xs">
        <div>
          <span className="font-semibold text-slate-300">Affected Population: </span>
          <span className="text-slate-400">{analysis.affected_population}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">AI Reasoning: </span>
          <span className="text-slate-300 italic leading-relaxed font-sans">{analysis.reason}</span>
        </div>
        {analysis.isHumanOverridden && (
          <div className="pt-2 border-t border-slate-700/60 text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
            <span className="font-bold">Human Override Note: </span>
            <span className="text-amber-200/90">{analysis.overrideReason} (by {analysis.overriddenBy} on {new Date(analysis.overriddenAt || '').toLocaleDateString()})</span>
          </div>
        )}
      </div>

      {/* Human-in-the-Loop Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-bold text-white text-lg">
                  Human-in-the-Loop Calibration
                </h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              As part of the accountable AI architecture, officers can correct or fine-tune machine recommendations. All edits are permanently logged in the audit trail.
            </p>

            <form onSubmit={handleOverride} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Street Lighting">Street Lighting</option>
                  <option value="Solid Waste Management">Solid Waste Management</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Drainage & Sewage">Drainage & Sewage</option>
                  <option value="Public Health">Public Health</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Risk Level</label>
                  <select
                    value={risk}
                    onChange={e => setRisk(e.target.value as RiskLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Final Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Audit Justification / Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="e.g. Ground inspection verified live 440V wire risk requiring immediate Critical escalation."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/50"
                >
                  {isSubmitting ? 'Recording Audit...' : 'Save & Log Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
