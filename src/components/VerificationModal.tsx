import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';
import { Resolution } from '../types';

interface VerificationModalProps {
  complaintId: string;
  complaintTitle: string;
  resolution?: Resolution;
  onClose: () => void;
  onConfirmResolved: (feedback: string) => Promise<void>;
  onReopen: (reason: string, evidenceUrl?: string) => Promise<void>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  complaintId,
  complaintTitle,
  resolution,
  onClose,
  onConfirmResolved,
  onReopen
}) => {
  const [decision, setDecision] = useState<'resolved' | 'reopen' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenEvidenceUrl, setReopenEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (decision === 'resolved') {
        await onConfirmResolved(feedback || 'Citizen confirmed issue is resolved.');
      } else if (decision === 'reopen') {
        await onReopen(reopenReason, reopenEvidenceUrl || undefined);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-700 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-heading font-bold text-white text-lg">
                Citizen Resolution Verification
              </h3>
              <p className="text-xs text-slate-400 font-mono">Grievance #{complaintId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
            &times;
          </button>
        </div>

        {/* Resolution Details Provided by Officer */}
        {resolution && (
          <div className="bg-[#1e293b]/70 border border-slate-700/70 rounded-xl p-3.5 mb-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Resolved by: <b className="text-white">{resolution.officerName}</b> ({resolution.departmentName})</span>
              <span className="font-mono">{new Date(resolution.submittedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-bold text-slate-300 block">Action Taken:</span>
              <p className="text-emerald-300 font-medium">{resolution.actionTaken}</p>
            </div>
            <div>
              <span className="font-bold text-slate-300 block">Description:</span>
              <p className="text-slate-300 italic">{resolution.description}</p>
            </div>
            {resolution.evidenceUrl && (
              <div className="mt-2">
                <span className="font-bold text-slate-300 block mb-1">Officer Proof Photo:</span>
                <img
                  src={resolution.evidenceUrl}
                  alt="Resolution Evidence"
                  className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Decision Buttons */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Is your grievance genuinely fixed on ground?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('resolved')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  decision === 'resolved'
                    ? 'border-emerald-500 bg-emerald-950/60 text-white shadow-md ring-2 ring-emerald-500/30'
                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="font-bold">✓ Issue Resolved</span>
                <span className="text-[10px] text-slate-400 text-center">I am satisfied with this resolution</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('reopen')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  decision === 'reopen'
                    ? 'border-rose-500 bg-rose-950/60 text-white shadow-md ring-2 ring-rose-500/30'
                    : 'border-slate-700 hover:border-rose-500/50 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <XCircle className="w-6 h-6 text-rose-400" />
                <span className="font-bold">✗ Issue Not Resolved</span>
                <span className="text-[10px] text-slate-400 text-center">Problem still persists; reopen ticket</span>
              </button>
            </div>
          </div>

          {/* Conditional inputs */}
          {decision === 'resolved' && (
            <div className="animate-in fade-in space-y-2">
              <label className="font-bold text-slate-300 block">Feedback / Rating for Officer</label>
              <textarea
                rows={2}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Thank you! The problem is fixed completely..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {decision === 'reopen' && (
            <div className="animate-in fade-in space-y-3 bg-rose-950/30 p-3.5 rounded-xl border border-rose-800/60">
              <div>
                <label className="font-bold text-rose-300 block mb-1">
                  Why is the issue unresolved? (Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  placeholder="e.g. Only 2 lights were turned on; remaining 4 are still dark and flickering..."
                  className="w-full p-2.5 rounded-xl border border-rose-700/60 bg-slate-900 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Optional Evidence Photo URL
                </label>
                <input
                  type="url"
                  value={reopenEvidenceUrl}
                  onChange={e => setReopenEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!decision || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                decision === 'resolved'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  : decision === 'reopen'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : decision === 'resolved'
                ? 'Confirm & Close Grievance'
                : decision === 'reopen'
                ? 'Reopen Grievance & Reset SLA'
                : 'Select Decision Above'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
