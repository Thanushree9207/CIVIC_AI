import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnalyticsData, Complaint } from '../types';
import { MapComponent } from '../components/MapComponent';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Sliders,
  Scale
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectComplaint, onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = () => {
      Promise.all([
        fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${user?.id || ''}` }
        })
          .then(res => res.json())
          .then(data => {
            if (isMounted && data.analytics) setAnalytics(data.analytics);
          })
          .catch(err => console.error('Analytics load error:', err)),

        fetch('/api/complaints', {
          headers: { Authorization: `Bearer ${user?.id || ''}` }
        })
          .then(res => res.json())
          .then(data => {
            if (isMounted && data.complaints) setComplaints(data.complaints);
          })
          .catch(err => console.error('Complaints load error:', err))
      ]).finally(() => {
        if (isMounted) setLoading(false);
      });
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-sm bg-[#020617] min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Compiling municipal intelligence and SLA metrics...</span>
      </div>
    );
  }

  const safeComplaints = complaints || [];
  const criticalAndEscalated = safeComplaints.filter(c => c.priority === 'CRITICAL' || c.status === 'ESCALATED');
  
  const rawDepts = analytics?.complaintsByDepartment || (analytics as any)?.departmentBreakdown || [];
  const departmentBreakdown = rawDepts.map((d: any) => {
    const total = d.count ?? d.total ?? 0;
    const resolved = d.resolved ?? 0;
    const active = Math.max(0, total - resolved);
    const breached = d.breached ?? 0;
    const complianceRate = d.complianceRate ?? (total > 0 ? Math.round((resolved / total) * 100) : 100);
    return {
      departmentName: d.department || d.departmentName || 'General Municipal',
      total,
      resolved,
      active,
      breached,
      complianceRate
    };
  });

  const priorityBreakdown = analytics?.priorityDistribution || (analytics as any)?.priorityBreakdown || [];
  const categoryBreakdown = analytics?.complaintsByCategory || (analytics as any)?.categoryBreakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#020617] text-slate-200 min-h-screen">
      {/* Header Command Banner (Bento Tile) */}
      <div className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Municipal Command & Accountability Dashboard
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white">
              Civic AI Intelligence Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supervising Commissioner Portal &bull; City-Wide SLA Compliance: <b className="text-emerald-400">{analytics?.slaComplianceRatePercent || 88}%</b>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-management')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <Sliders className="w-4 h-4 text-emerald-200" />
              Rule Engine & SLA Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Total Grievances</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-white">{analytics?.totalComplaints || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Logged across municipal grid</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">SLA Compliance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-emerald-400">
            {analytics?.slaComplianceRatePercent || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Resolved within mandated time</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Critical / Escalated</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-rose-400">
            {criticalAndEscalated.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Immediate supervisory focus</p>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-amber-300">
            {analytics?.avgResolutionTimeHours || 0}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From intake to citizen verification</p>
        </div>
      </div>

      {/* Middle Grid: Department Performance + AI Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department SLA & Load Performance (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Departmental Workload & SLA Compliance Breakdown
            </h3>
          </div>

          <div className="space-y-4">
            {departmentBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-mono">No department records available.</p>
            ) : (
              departmentBreakdown.map((dept, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{dept.departmentName}</span>
                    <span className="font-mono text-slate-400">
                      {dept.active} Active &bull; {dept.resolved} Resolved &bull; {dept.breached} Breached
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%` }}
                      className="bg-emerald-500 h-full"
                      title="Resolved"
                    />
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.active / dept.total) * 100 : 0}%` }}
                      className="bg-amber-500 h-full"
                      title="Active"
                    />
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.breached / dept.total) * 100 : 0}%` }}
                      className="bg-rose-500 h-full"
                      title="Breached"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Total Influx: <b className="text-white">{dept.total}</b></span>
                    <span>Compliance: <b className="text-emerald-400">{dept.complianceRate}%</b></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority & AI Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Dynamic Priority Classification
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {priorityBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-mono">No priority data available.</p>
            ) : (
              priorityBreakdown.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#1e293b]/60 border border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        p.priority === 'CRITICAL'
                          ? 'bg-rose-500'
                          : p.priority === 'HIGH'
                          ? 'bg-amber-500'
                          : p.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-white font-mono">{p.priority} PRIORITY</span>
                  </div>
                  <span className="font-heading font-extrabold text-base text-white">{p.count}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-2">
              Category Distribution
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {categoryBreakdown.length === 0 ? (
                <span className="text-xs text-slate-500 font-mono">No category data.</span>
              ) : (
                categoryBreakdown.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#1e293b] border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                  >
                    <span>{cat.category}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
                      {cat.count}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City-Wide Geolocation Hotspots Map */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            City-Wide Civic Geolocation Hotspots & Ward Clusters
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {safeComplaints.length} Live Incident Coordinates
          </span>
        </div>

        <MapComponent
          complaints={safeComplaints}
          onSelectComplaint={onSelectComplaint}
          height="450px"
        />
      </div>

      {/* Critical & Escalated Watchlist */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="font-heading font-bold text-white text-base">
              Immediate Escalations & Critical Risk Registry
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800/60">
            {criticalAndEscalated.length} High-Risk Dossiers
          </span>
        </div>

        {criticalAndEscalated.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            No critical or escalated grievances pending intervention.
          </div>
        ) : (
          <div className="space-y-3">
            {criticalAndEscalated.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="bg-[#1e293b]/60 hover:bg-[#1e293b] p-4 rounded-xl border border-rose-900/40 hover:border-rose-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{c.id}</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-700/60">
                      {c.priority} PRIORITY
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.departmentName}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors">
                    {c.title}
                  </h4>

                  <p className="text-xs text-slate-400 truncate">{c.locationAddress}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    Officer: <b className="text-white">{c.assignedOfficerName}</b>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                    Inspect <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
