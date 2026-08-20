import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Users,
  Building2,
  RefreshCw,
  Eye,
  Bot,
  Sliders,
  Scale
} from 'lucide-react';

interface LandingPageProps {
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTab }) => {
  const { demoUsers, switchUser } = useAuth();

  const pipelineStages = [
    {
      step: '01',
      title: 'AI UNDERSTANDING',
      badge: 'gemini-3.7-flash',
      desc: 'Transforms free-form citizen complaints into structured intelligence (severity, affected population, physical safety hazards, category).',
      icon: <Bot className="w-5 h-5 text-emerald-400" />
    },
    {
      step: '02',
      title: 'RULE ENGINE PRIORITY',
      badge: 'Configurable Rules',
      desc: 'Transparent multi-variable policy engine assigns Priority (Critical/High/Med/Low) with clear audit justification, not opaque blackbox scoring.',
      icon: <Scale className="w-5 h-5 text-amber-400" />
    },
    {
      step: '03',
      title: 'DEPARTMENT & SLA ROUTING',
      badge: 'Auto Load-Balanced',
      desc: 'Routes to eligible department & officer with fewest active grievances. Automatically starts SLA deadline timer.',
      icon: <Building2 className="w-5 h-5 text-blue-400" />
    },
    {
      step: '04',
      title: 'OFFICER GROUND RESOLUTION',
      badge: 'Evidence Backed',
      desc: 'Officer inspects, consults semantic historical precedents, fixes issue, and uploads mandatory photographic evidence.',
      icon: <Clock className="w-5 h-5 text-purple-400" />
    },
    {
      step: '05',
      title: 'CITIZEN VERIFICATION',
      badge: 'Accountability Gate',
      desc: 'The citizen confirms genuine ground resolution (✓ Satisfied) or Reopens (✗ Unresolved), preventing fake paper closures.',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />
    },
    {
      step: '06',
      title: 'SYSTEM LEARNING & AUDIT',
      badge: '100% Immutable',
      desc: 'Every state change, officer action, and AI extraction is recorded in the permanent municipal audit ledger for administrative oversight.',
      icon: <RefreshCw className="w-5 h-5 text-cyan-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* SIH Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              Smart India Hackathon 2026 Student Prototype
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Civic<span className="text-emerald-400">AI</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-300 mt-2 font-heading">
                AI-Powered Grievance Intelligence & Accountability Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 font-normal">
              An AI-assisted governance layer that understands natural-language citizen grievances, enforces dynamic SLA deadlines, eliminates misrouting, and guarantees citizen-verified ground resolutions.
            </p>

            {/* Bento Quick Demo Launchers */}
            <div className="bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl max-w-2xl mx-auto mb-8">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block mb-3 text-center">
                Launch Live Prototype Demo (Select Persona):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    const c = demoUsers.find(u => u.role === 'CITIZEN') || {
                      id: 'USR-CITIZEN-1',
                      name: 'Aarav Sharma',
                      email: 'aarav.sharma@example.com',
                      phone: '9876543210',
                      role: 'CITIZEN'
                    };
                    switchUser(c);
                    onSelectTab('citizen-dashboard');
                  }}
                  className="p-3.5 rounded-xl bg-[#1e293b]/70 hover:bg-[#1e293b] border border-slate-700 hover:border-emerald-500/50 text-left transition-all hover:scale-102 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                      Citizen
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-bold text-sm text-white">Aarav Sharma</div>
                  <div className="text-[11px] text-slate-400">File & Verify Grievances</div>
                </button>

                <button
                  onClick={() => {
                    const off = demoUsers.find(u => u.role === 'OFFICER') || {
                      id: 'USR-OFFICER-1',
                      name: 'Rajesh Kumar',
                      email: 'rajesh.kumar@civic.gov.in',
                      phone: '9845012345',
                      role: 'OFFICER',
                      departmentId: 'DEPT-ELEC',
                      departmentName: 'Electrical Department'
                    };
                    switchUser(off);
                    onSelectTab('officer-dashboard');
                  }}
                  className="p-3.5 rounded-xl bg-[#1e293b]/70 hover:bg-[#1e293b] border border-slate-700 hover:border-amber-500/50 text-left transition-all hover:scale-102 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                      Officer
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-bold text-sm text-white">Rajesh Kumar</div>
                  <div className="text-[11px] text-slate-400">Electrical Dept (SLA)</div>
                </button>

                <button
                  onClick={() => {
                    const adm = demoUsers.find(u => u.role === 'ADMIN') || {
                      id: 'USR-ADMIN-1',
                      name: 'Dr. Ananya Iyer',
                      email: 'ananya.iyer@civic.gov.in',
                      phone: '9845011111',
                      role: 'ADMIN'
                    };
                    switchUser(adm);
                    onSelectTab('admin-dashboard');
                  }}
                  className="p-3.5 rounded-xl bg-[#1e293b]/70 hover:bg-[#1e293b] border border-slate-700 hover:border-purple-500/50 text-left transition-all hover:scale-102 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500 text-slate-950">
                      Admin
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-bold text-sm text-white">Dr. Ananya Iyer</div>
                  <div className="text-[11px] text-slate-400">Municipal Commissioner</div>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Gemini 3.7 Flash API
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 15s Background SLA Daemon
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dynamic Leaflet GIS Pin Map
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Paradigm Workflow Section */}
      <section className="py-16 bg-[#020617] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block mb-2">
              The Civic AI Paradigm
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              UNDERSTAND &rarr; PRIORITIZE &rarr; ROUTE &rarr; RESOLVE &rarr; VERIFY &rarr; LEARN
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed not as an autonomous government decision-maker, but as an auditable, human-in-the-loop accountability layer.
            </p>
          </div>

          {/* Bento Grid of 6 Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineStages.map(stage => (
              <div
                key={stage.step}
                className="bg-[#0f172a] rounded-2xl p-6 border border-slate-800 hover:border-slate-700 hover:bg-[#1e293b]/50 transition-all group shadow-lg shadow-black/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {stage.icon}
                  </div>
                  <span className="font-mono text-xs font-extrabold text-slate-500">STAGE {stage.step}</span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {stage.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-white text-base mb-2">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="py-16 bg-[#020617] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block mb-2">
              Impact Analysis
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Transforming Traditional Public Grievance Portals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="bg-[#0f172a] border border-rose-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4 text-rose-400 font-bold text-lg font-heading">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Legacy Portals (CPGRAMS / Municipal Apps)
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Citizen Burden:</strong> Citizens are forced to guess complicated administrative departments, zones, and technical codes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Misrouting & Ping-Pong:</strong> Tickets bounce endlessly between Electrical, PWD, and Sanitation departments without ownership.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Silent SLA Breaches:</strong> No automated deadline escalation; urgent hospital water/road issues sit dormant in queues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Fake Paper Closures:</strong> Officers mark grievances "Closed" without ground inspection or photographic proof.</span>
                </li>
              </ul>
            </div>

            {/* The Civic AI Solution */}
            <div className="bg-[#0f172a] border border-emerald-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4 text-emerald-400 font-bold text-lg font-heading">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                The Civic AI Breakthrough Layer
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Zero-Friction Submission:</strong> Citizen types simple plain language or drops a pin on the map; AI extracts structured parameters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Rule-Based Routing & Load Balance:</strong> Transparent rule engine assigns department and officer with fewest active tickets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Automated Background SLA Watchdog:</strong> 15-second daemon monitors timers, warns at 75%, and escalates to commissioner on breach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold text-base leading-none">&bull;</span>
                  <span><strong>Mandatory Citizen Verification:</strong> Tickets cannot permanently close until the citizen verifies resolution satisfaction or reopens.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Civic AI &bull; Smart India Hackathon 2026
          </div>
          <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
            <span>SLA MONITOR: <strong className="text-emerald-400 uppercase">Operational</strong></span>
            <span>VECTOR ENGINE: <strong className="text-emerald-400 uppercase">Active</strong></span>
            <span>AUDIT LOG: <strong className="text-slate-300">SECURE-NODE-04</strong></span>
          </div>
          <p className="text-slate-500 text-center sm:text-right text-[11px]">
            &copy; 2026 Civic AI Platform | SIH-2026 Prototype Build
          </p>
        </div>
      </footer>
    </div>
  );
};
