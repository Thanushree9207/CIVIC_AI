import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface NotificationsPageProps {
  onSelectComplaintId?: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onSelectComplaintId }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    if (!user) return;
    setLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${user.id}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${user.id}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const safeNotifications = notifications || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#020617] text-slate-200 min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time updates, SLA escalation alerts, and citizen verification notices
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 cursor-pointer transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {safeNotifications.length === 0 ? (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-12 text-center text-slate-400 text-xs font-mono">
          No notifications recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {safeNotifications.map((n, idx) => (
            <div
              key={`${n.id || 'notif'}-${idx}`}
              onClick={() => n.complaintId && onSelectComplaintId && onSelectComplaintId(n.complaintId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md ${
                n.isRead
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  : 'bg-[#1e293b] border-emerald-500/50 shadow-emerald-950/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.type === 'ALERT' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    ) : n.type === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      {n.title}
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{n.message}</p>
                    {n.complaintId && (
                      <span className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2">
                        View Grievance #{n.complaintId} <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
