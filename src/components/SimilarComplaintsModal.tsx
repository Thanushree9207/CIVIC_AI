import React from 'react';
import { SimilarComplaint } from '../types';
import { CopyCheck, Sparkles, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface SimilarComplaintsModalProps {
  similarComplaints?: SimilarComplaint[];
  historicalRecommendation?: string;
  isDuplicateFlagged?: boolean;
}

export const SimilarComplaintsModal: React.FC<SimilarComplaintsModalProps> = ({
  similarComplaints = [],
  historicalRecommendation,
  isDuplicateFlagged
}) => {
  const safeSimilar = similarComplaints || [];

  return (
    <div className="space-y-4">
      {/* Historical Precedent Advisory Recommendation (Advisory Only - Officer Discretion) */}
      {historicalRecommendation && (
        <div className="bg-[#1e293b]/90 border-l-4 border-amber-500 p-4 rounded-r-2xl border-y border-r border-slate-700/60 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Historical Precedent Advisory (Non-Binding Recommendation)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Officer Discretion
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
            "{historicalRecommendation}"
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>* Derived from previous resolved complaints in this ward/category.</span>
            <span className="text-amber-400/90 font-semibold">⚠️ Advisory guidance only &mdash; Does NOT override officer judgment</span>
          </div>
        </div>
      )}

      {/* Semantic Similar & Duplicate Detection List */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <CopyCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-heading font-bold text-white text-sm">
              Semantic Duplicate & Precedent Matcher
            </h4>
          </div>
          {isDuplicateFlagged && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-700/60">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              POSSIBLE DUPLICATE
            </span>
          )}
        </div>

        {safeSimilar.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No high-similarity grievances detected in active proximity database.
          </p>
        ) : (
          <div className="space-y-2.5">
            {safeSimilar.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  item.similarity >= 80
                    ? 'bg-amber-950/20 border-amber-800/50'
                    : 'bg-[#1e293b]/70 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white font-mono">
                    #{item.id} &bull; {item.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.similarity >= 80
                          ? 'bg-amber-900/80 text-amber-200 border border-amber-700/60'
                          : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/60'
                      }`}
                    >
                      {item.similarity}% Match
                    </span>
                    <span className="text-[10px] text-slate-400">({item.status})</span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs mb-2">{item.title}</p>

                {item.resolutionNotes && (
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold font-mono">Precedent Resolution: </span>
                    {item.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
