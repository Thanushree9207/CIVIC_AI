import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, PriorityLevel } from '../types';
import { SLABadge } from '../components/SLABadge';
import { MapComponent } from '../components/MapComponent';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Filter,
  Search,
  MapPin,
  ArrowRight,
  Shield,
  Layers,
  Map,
  FileCheck2,
  Phone,
  Sparkles,
  Building2
} from 'lucide-react';

interface OfficerDashboardProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ onSelectComplaint }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'DEPT' | 'ALL'>('DEPT');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'WARNING' | 'BREACHED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchOfficerComplaints = () => {
    if (!user) return;
    setLoading(true);
    const queryParam = scope === 'ALL' ? '?departmentId=ALL' : '';
    fetch(`/api/complaints${queryParam}`, {
      headers: { Authorization: `Bearer ${user.id}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.complaints) setComplaints(data.complaints);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOfficerComplaints();
    const timer = setInterval(fetchOfficerComplaints, 10000);
    return () => clearInterval(timer);
  }, [user, scope]);

  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'ASSIGNED' && c.status !== 'ASSIGNED') return false;
    if (activeFilter === 'IN_PROGRESS' && c.status !== 'IN_PROGRESS' && c.status !== 'REOPENED') return false;
    if (activeFilter === 'WARNING' && c.sla.status !== 'WARNING') return false;
    if (activeFilter === 'BREACHED' && (c.sla.status !== 'BREACHED' && c.status !== 'ESCALATED')) return false;
    if (activeFilter === 'RESOLVED' && !['RESOLUTION_PENDING_VERIFICATION', 'VERIFIED', 'CLOSED'].includes(c.status)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.locationAddress.toLowerCase().includes(q) ||
        (c.departmentName && c.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeCount = complaints.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'].includes(c.status)).length;
  const warningCount = complaints.filter(c => c.sla.status === 'WARNING').length;
  const breachedCount = complaints.filter(c => c.sla.isBreached || c.status === 'ESCALATED').length;
  const resolvedCount = complaints.filter(c => ['RESOLUTION_PENDING_VERIFICATION', 'VERIFIED', 'CLOSED'].includes(c.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#020617] text-slate-200 min-h-screen">
      {/* Header Deck (Bento Tile) */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">
              {user?.departmentName || 'Public Works Department'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Officer Workqueue</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Field Officer Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as <b className="text-white">{user?.name}</b> &bull; Real-time SLA Tracking Active
          </p>
        </div>

        {/* Scope & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Selector */}
          <div className="flex items-center bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setScope('DEPT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'DEPT' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Department
            </button>
            <button
              onClick={() => setScope('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'ALL' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All City Zones
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              List Queue
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              GIS Map Grid
            </button>
          </div>
        </div>
      </div>

      {/* Bento 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeFilter === 'ALL'
              ? 'bg-[#1e293b] border-emerald-500/70 ring-1 ring-emerald-500/30'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Total Assigned</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-white">{complaints.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Grievances in queue</p>
        </div>

        <div
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-[#1e293b] border-amber-500/70 ring-1 ring-amber-500/30'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Active Field Work</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-amber-300">{activeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under SLA countdown</p>
        </div>

        <div
          onClick={() => setActiveFilter('WARNING')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeFilter === 'WARNING'
              ? 'bg-[#1e293b] border-yellow-500/70 ring-1 ring-yellow-500/30'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">SLA Warnings (&gt;75%)</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-yellow-300">{warningCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Approaching breach</p>
        </div>

        <div
          onClick={() => setActiveFilter('BREACHED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeFilter === 'BREACHED'
              ? 'bg-[#1e293b] border-rose-500/70 ring-1 ring-rose-500/30'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Breached / Escalated</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-heading font-extrabold text-rose-400">{breachedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Overdue tickets</p>
        </div>
      </div>

      {/* Main Content: Map or Filtered List */}
      {viewMode === 'map' ? (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              GIS Geolocation Map Grid ({filteredComplaints.length} Grievance Locations)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Color coded by Priority & SLA status
            </span>
          </div>

          <MapComponent
            complaints={filteredComplaints}
            onSelectComplaint={onSelectComplaint}
            height="550px"
          />
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ID, title, locality..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-[11px]">
              {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'WARNING', 'BREACHED', 'RESOLVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === f
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List Entries */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Synchronizing active workqueue from municipal server...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              No grievances match the active filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map(c => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md group ${
                    c.sla.isBreached || c.status === 'ESCALATED'
                      ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                      : c.sla.status === 'WARNING'
                      ? 'bg-yellow-950/20 border-yellow-900/60 hover:border-yellow-700'
                      : 'bg-[#1e293b]/60 border-slate-700/60 hover:border-slate-600 hover:bg-[#1e293b]'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
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
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c.departmentName || 'General Dept'}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors">
                      {c.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {c.locationAddress}
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-400">
                        Citizen: {c.citizenName} {c.citizenPhone ? `(${c.citizenPhone})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <SLABadge sla={c.sla} />
                    <span
                      className={`text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-xl border ${
                        c.status === 'VERIFIED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : c.status === 'RESOLUTION_PENDING_VERIFICATION'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                          : c.status === 'ESCALATED'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
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
      )}
    </div>
  );
};
