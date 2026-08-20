import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Department, Officer, RulesConfig, AuditLog } from '../types';
import {
  Sliders,
  Building2,
  Users,
  History,
  CheckCircle2,
  Clock,
  Scale,
  Save,
  Plus,
  Shield,
  Bot,
  UserCheck
} from 'lucide-react';

export const AdminManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'departments' | 'officers' | 'audit'>('rules');
  const [rulesConfig, setRulesConfig] = useState<RulesConfig | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Department Form state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptSupervisor, setNewDeptSupervisor] = useState('');
  const [isAddingDept, setIsAddingDept] = useState(false);

  const loadData = () => {
    fetch('/api/admin/rules', {
      headers: { Authorization: `Bearer ${user?.id || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.rulesConfig) setRulesConfig(data.rulesConfig);
      });

    fetch('/api/admin/departments', {
      headers: { Authorization: `Bearer ${user?.id || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.departments) setDepartments(data.departments);
      });

    fetch('/api/admin/officers', {
      headers: { Authorization: `Bearer ${user?.id || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.officers) setOfficers(data.officers);
      });

    fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${user?.id || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.logs) setAuditLogs(data.logs);
      });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulesConfig) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || ''}`
        },
        body: JSON.stringify(rulesConfig)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || ''}`
        },
        body: JSON.stringify({
          name: newDeptName,
          code: newDeptCode.toUpperCase(),
          description: newDeptDesc,
          supervisorName: newDeptSupervisor
        })
      });
      if (res.ok) {
        setIsAddingDept(false);
        setNewDeptName('');
        setNewDeptCode('');
        setNewDeptDesc('');
        setNewDeptSupervisor('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#020617] text-slate-200 min-h-screen">
      {/* Header Deck (Bento Tile) */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              System Administration
            </span>
            <span className="text-xs text-slate-400 font-mono">Control Deck</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Rule Engine & Municipal Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic priority weights, SLA resolution thresholds, departments, and inspect the tamper-proof audit trail.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center bg-[#1e293b] p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Rule Engine
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'departments' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Departments
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'officers' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Officers
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> System Audit Trail
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {/* 1. RULE ENGINE CONFIGURATION */}
      {activeTab === 'rules' && rulesConfig && (
        <form onSubmit={handleSaveRules} className="space-y-6">
          {/* SLA Thresholds */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Mandated SLA Resolution Times (Hours)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Maximum permitted hours before automatic escalation and breach logging.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> Configuration Saved!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">Critical Priority</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rulesConfig.slaRules.CRITICAL}
                    onChange={e =>
                      setRulesConfig({
                        ...rulesConfig,
                        slaRules: { ...rulesConfig.slaRules, CRITICAL: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-heading font-bold text-lg"
                  />
                  <span className="text-xs text-slate-400 font-mono">hrs</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">High Priority</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rulesConfig.slaRules.HIGH}
                    onChange={e =>
                      setRulesConfig({
                        ...rulesConfig,
                        slaRules: { ...rulesConfig.slaRules, HIGH: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-heading font-bold text-lg"
                  />
                  <span className="text-xs text-slate-400 font-mono">hrs</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono font-bold text-yellow-400 block uppercase">Medium Priority</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rulesConfig.slaRules.MEDIUM}
                    onChange={e =>
                      setRulesConfig({
                        ...rulesConfig,
                        slaRules: { ...rulesConfig.slaRules, MEDIUM: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-heading font-bold text-lg"
                  />
                  <span className="text-xs text-slate-400 font-mono">hrs</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">Low Priority</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rulesConfig.slaRules.LOW}
                    onChange={e =>
                      setRulesConfig({
                        ...rulesConfig,
                        slaRules: { ...rulesConfig.slaRules, LOW: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-heading font-bold text-lg"
                  />
                  <span className="text-xs text-slate-400 font-mono">hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semantic Duplicate Threshold */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              Semantic Duplicate Clustering Threshold
            </h3>
            <p className="text-xs text-slate-400">
              When Gemini embedding cosine similarity between two grievances within 500m exceeds this value, they are clustered as duplicates.
            </p>
            <div className="flex items-center gap-4 max-w-xs">
              <input
                type="range"
                min="50"
                max="95"
                value={rulesConfig.duplicateThresholdPercent}
                onChange={e =>
                  setRulesConfig({
                    ...rulesConfig,
                    duplicateThresholdPercent: Number(e.target.value)
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-emerald-400 text-sm">{rulesConfig.duplicateThresholdPercent}%</span>
            </div>
          </div>
        </form>
      )}

      {/* 2. DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-white text-lg">
              Configured Municipal Departments ({departments.length})
            </h3>
            <button
              onClick={() => setIsAddingDept(!isAddingDept)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          {isAddingDept && (
            <form onSubmit={handleAddDepartment} className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-white text-sm">Register New Department</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Department Name (e.g., Road Maintenance)"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Code (e.g., ROAD)"
                  value={newDeptCode}
                  onChange={e => setNewDeptCode(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Supervisor Name"
                  value={newDeptSupervisor}
                  onChange={e => setNewDeptSupervisor(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDept(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(departments || []).map(dept => (
              <div key={dept.id} className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {dept.id}</span>
                </div>
                <h4 className="font-heading font-bold text-white text-base">{dept.name}</h4>
                <p className="text-xs text-slate-400">{dept.description}</p>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                  Supervisor: <b className="text-white">{dept.supervisorName}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OFFICERS */}
      {activeTab === 'officers' && (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Field Officer Roster & Load Balancer State
            </h3>
            <span className="text-xs text-slate-400 font-mono">{(officers || []).length} Active Officers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Officer Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Active Load</th>
                  <th className="p-3">Resolved</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(officers || []).map(off => (
                  <tr key={off.id} className="hover:bg-[#1e293b]/50">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      {off.name}
                    </td>
                    <td className="p-3">{off.departmentName}</td>
                    <td className="p-3 text-slate-400">{off.designation}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{off.activeComplaintsCount} Active</td>
                    <td className="p-3 font-mono text-emerald-400">{off.resolvedComplaintsCount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        AVAILABLE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Municipal Tamper-Proof Audit Log Trail
            </h3>
            <span className="text-xs text-slate-400 font-mono">{(auditLogs || []).length} Total Audit Records</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
            {(auditLogs || []).map(log => (
              <div key={log.id} className="p-3.5 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.userName} ({log.userRole})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 font-sans">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
