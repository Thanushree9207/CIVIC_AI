import React, { useState } from 'react';
import { CheckCircle2, Upload, Camera, AlertCircle } from 'lucide-react';

interface ResolutionEvidenceModalProps {
  complaintId: string;
  complaintTitle: string;
  onClose: () => void;
  onSubmitResolution: (data: {
    description: string;
    actionTaken: string;
    evidenceUrl?: string;
  }) => Promise<void>;
}

export const ResolutionEvidenceModal: React.FC<ResolutionEvidenceModalProps> = ({
  complaintId,
  complaintTitle,
  onClose,
  onSubmitResolution
}) => {
  const [actionTaken, setActionTaken] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleEvidencePhotos = [
    { label: 'Electrical Repair & New Fixture', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
    { label: 'Pothole Bitumen Asphalt Patch', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Garbage Cleared & Sanitized', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Water Main Pipe Replaced', url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken || !description) return;

    setIsSubmitting(true);
    try {
      await onSubmitResolution({
        actionTaken,
        description,
        evidenceUrl: evidenceUrl.trim() || undefined
      });
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
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-heading font-bold text-white text-lg">
                Submit Ground Resolution & Evidence
              </h3>
              <p className="text-xs text-slate-400 font-mono">Grievance #{complaintId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
            &times;
          </button>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 mb-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">Civic AI Accountability Rule:</strong> Submitting resolution stops the active SLA timer and transitions the grievance to <b>RESOLUTION PENDING VERIFICATION</b>. The ticket is only closed once the citizen verifies satisfaction.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Specific Action Taken *</label>
            <input
              type="text"
              required
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder="e.g. Replaced 63A blown contactor and 4 LED luminaires"
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Detailed Technical Resolution Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the root cause diagnostic, parts replaced, manpower deployed, and final test results on-site..."
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Photographic Evidence URL (After Fix)</label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={e => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono text-[11px]"
            />
            <div className="mt-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Quick Select Demo Proof Photos:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {sampleEvidencePhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEvidenceUrl(photo.url)}
                    className="text-left p-2 rounded-lg border border-slate-700/70 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-[10px] font-medium text-slate-300 truncate transition-colors"
                  >
                    {photo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {evidenceUrl && (
            <div className="mt-2 p-2 bg-[#1e293b]/70 rounded-xl border border-slate-700/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Evidence Preview:</span>
              <img
                src={evidenceUrl}
                alt="Evidence"
                className="w-full h-32 object-cover rounded-lg border border-slate-700"
                referrerPolicy="no-referrer"
              />
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Resolution & Notify Citizen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
