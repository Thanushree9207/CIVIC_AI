import React from 'react';
import { AuditLog } from '../types';
import { History, User, Bot, Clock, ArrowRight, Shield } from 'lucide-react';

interface AuditTimelineProps {
  logs?: AuditLog[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs = [] }) => {
  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-blue-600 text-white border-blue-400';
    if (action.includes('AI_')) return 'bg-indigo-600 text-white border-indigo-400';
    if (action.includes('ROUTING') || action.includes('ASSIGNED')) return 'bg-cyan-600 text-white border-cyan-400';
    if (action.includes('RESOLUTION')) return 'bg-emerald-600 text-white border-emerald-400';
    if (action.includes('VERIFIED')) return 'bg-teal-600 text-white border-teal-400';
    if (action.includes('REOPENED')) return 'bg-rose-600 text-white border-rose-400';
    if (action.includes('BREACHED')) return 'bg-rose-700 text-white border-rose-500';
    if (action.includes('OVERRIDE')) return 'bg-amber-600 text-white border-amber-400';
    return 'bg-slate-700 text-white border-slate-500';
  };

  const safeLogs = logs || [];

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-lg shadow-black/40">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80 mb-4">
        <History className="w-5 h-5 text-emerald-400" />
        <h3 className="font-heading font-bold text-white text-base">
          Immutable Audit Trail & Activity Ledger
        </h3>
      </div>

      <div className="space-y-4">
        {safeLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No audit records logged yet.</p>
        ) : (
          safeLogs.map((log, index) => (
            <div key={log.id || index} className="flex items-start gap-3 relative pb-4 last:pb-0">
              {/* Connector line */}
              {index < safeLogs.length - 1 && (
                <span className="absolute top-6 left-3 w-0.5 h-full -ml-[1px] bg-slate-800" />
              )}

              {/* Node Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shrink-0 border shadow-xs ${getActionColor(
                  log.action
                )}`}
              >
                {log.userId?.includes('AI') ? (
                  <Bot className="w-3 h-3" />
                ) : log.userId?.includes('SLA') ? (
                  <Clock className="w-3 h-3" />
                ) : log.userRole === 'ADMIN' ? (
                  <Shield className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
              </div>

              {/* Bento Content Tile */}
              <div className="flex-1 bg-[#1e293b]/70 rounded-xl p-3.5 border border-slate-700/50 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{log.userName}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        log.userRole === 'ADMIN'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : log.userRole === 'OFFICER'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    {log.action}
                  </span>
                  <span>{log.details}</span>
                </div>

                {log.previousState && log.newState && (
                  <div className="mt-2 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 font-mono flex items-center gap-2 text-slate-400">
                    <span>{log.previousState.status || JSON.stringify(log.previousState)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-white font-bold">{log.newState.status || JSON.stringify(log.newState)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
