import React from 'react';
import { ComplaintSLA, SLAStatus } from '../types';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

interface SLABadgeProps {
  sla: ComplaintSLA;
  showDetails?: boolean;
}

export const SLABadge: React.FC<SLABadgeProps> = ({ sla, showDetails = false }) => {
  const getBadgeStyle = (status: SLAStatus) => {
    switch (status) {
      case 'BREACHED':
        return {
          bg: 'bg-rose-950/70 text-rose-300 border-rose-700/60 shadow-xs shadow-rose-950/50',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
          label: 'SLA BREACHED',
          desc: 'Escalated to Higher Authority'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-950/70 text-amber-300 border-amber-700/60 shadow-xs shadow-amber-950/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />,
          label: 'SLA WARNING',
          desc: `${sla.remainingHours}h remaining to deadline`
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 shadow-xs shadow-emerald-950/50',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'SLA MET',
          desc: `Completed in ${sla.elapsedHours}h`
        };
      default:
        return {
          bg: 'bg-blue-950/70 text-blue-300 border-blue-700/60 shadow-xs shadow-blue-950/50',
          icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
          label: 'ON TRACK',
          desc: `${sla.remainingHours}h remaining of ${sla.durationHours}h SLA`
        };
    }
  };

  const style = getBadgeStyle(sla.status);

  return (
    <div className="inline-flex flex-col">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${style.bg}`}>
        {style.icon}
        <span>{style.label}</span>
        <span className="text-[11px] font-mono opacity-90 text-slate-300">({sla.remainingHours}h left)</span>
      </div>
      {showDetails && (
        <span className="text-[11px] text-slate-400 mt-1 font-mono">
          Deadline: {new Date(sla.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};
