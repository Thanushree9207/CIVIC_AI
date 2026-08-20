import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Bell,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  FilePlus,
  BarChart3,
  Sliders,
  FileText
} from 'lucide-react';
import { Notification } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, demoUsers, switchUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${user.id}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const safeNotifications = notifications || [];
  const safeDemoUsers = demoUsers || [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    if (!user) return;
    fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${user.id}` }
    }).then(() => {
      setNotifications(prev => (prev || []).map(n => ({ ...n, isRead: true })));
    });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            ADMIN
          </span>
        );
      case 'OFFICER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            OFFICER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            CITIZEN
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Hackathon Banner */}
      <div className="bg-[#020617] text-slate-400 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">
            SIH 2026
          </span>
          <span className="font-medium text-slate-300 text-[11px] hidden sm:inline">
            Grievance Intelligence & Accountability Platform (AI Assisted Layer)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400">
            SLA: <strong className="text-emerald-400">15s TICK</strong>
          </span>
          <span className="text-slate-400 hidden sm:inline">
            MODEL: <strong className="text-amber-300">gemini-3.7-flash</strong>
          </span>
        </div>
      </div>

      {/* Main Bento Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab(user ? (user.role === 'CITIZEN' ? 'citizen-dashboard' : user.role === 'OFFICER' ? 'officer-dashboard' : 'admin-dashboard') : 'landing')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-heading">
                  Civic<span className="text-emerald-400">Ai</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  MVP
                </span>
              </div>
            </button>

            {/* Navigation Tabs based on Role */}
            {user && (
              <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
                {user.role === 'CITIZEN' && (
                  <>
                    <button
                      onClick={() => onSelectTab('citizen-dashboard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'citizen-dashboard'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => onSelectTab('submit-complaint')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'submit-complaint'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      File Grievance
                    </button>
                    <button
                      onClick={() => onSelectTab('my-complaints')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'my-complaints'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      My Grievances
                    </button>
                  </>
                )}

                {user.role === 'OFFICER' && (
                  <>
                    <button
                      onClick={() => onSelectTab('officer-dashboard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'officer-dashboard'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Officer Workqueue
                    </button>
                    <button
                      onClick={() => onSelectTab('officer-complaints')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'officer-complaints'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      SLA & Actions
                    </button>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => onSelectTab('admin-dashboard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'admin-dashboard'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Command Analytics
                    </button>
                    <button
                      onClick={() => onSelectTab('admin-complaints')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'admin-complaints'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      All Grievances
                    </button>
                    <button
                      onClick={() => onSelectTab('admin-management')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentTab === 'admin-management'
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Rules, SLA & Depts
                    </button>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Switch role for demo"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-left hidden sm:block">
                  <span className="text-[9px] text-slate-400 block leading-tight font-mono">DEMO PERSONA:</span>
                  <span className="font-bold text-white text-xs">{user?.name || 'Select'}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white font-heading">Switch Demo Role (1-Click)</p>
                    <p className="text-[10px] text-slate-400">Test different views instantly</p>
                  </div>
                  <div className="space-y-1">
                    {safeDemoUsers.map(du => (
                      <button
                        key={du.id}
                        onClick={() => {
                          switchUser(du);
                          setShowPersonaMenu(false);
                          if (du.role === 'CITIZEN') onSelectTab('citizen-dashboard');
                          else if (du.role === 'OFFICER') onSelectTab('officer-dashboard');
                          else onSelectTab('admin-dashboard');
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          user?.id === du.id ? 'bg-emerald-950/40 border border-emerald-500/40 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {du.name}
                            {user?.id === du.id && <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1 py-0.2 rounded font-mono">Active</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {du.role === 'ADMIN' ? 'Municipal Commissioner' : du.role === 'OFFICER' ? `${du.departmentName}` : 'Registered Citizen'}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            du.role === 'ADMIN'
                              ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                              : du.role === 'OFFICER'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                              : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          {du.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Auth Actions in Persona menu */}
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between px-1">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onSelectTab('register');
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" /> Register Citizen
                    </button>
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onSelectTab('login');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white font-medium hover:underline cursor-pointer"
                    >
                      Sign In with Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors cursor-pointer border border-slate-700/60"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5 font-heading">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {safeNotifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                    ) : (
                      safeNotifications.map((n, idx) => (
                        <div
                          key={`${n.id || 'notif'}-${idx}`}
                          className={`p-2.5 rounded-lg border text-xs transition-colors ${
                            n.isRead ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-800/70 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-white flex items-center gap-1">
                              {n.type === 'ALERT' ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              ) : n.type === 'WARNING' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role indicator badge */}
            <div className="hidden lg:block">{getRoleBadge(user?.role)}</div>

            {/* Landing page link */}
            <button
              onClick={() => onSelectTab('landing')}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Overview & Architecture"
            >
              Overview
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
