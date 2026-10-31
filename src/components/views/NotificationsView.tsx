import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { Bell, CheckCircle2, Clock, ShieldAlert, Award } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { currentUser } = useAuth();

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return dataEngine.getNotifications(currentUser.id);
  }, [currentUser?.id]);

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    notifications.forEach((n) => dataEngine.markNotificationRead(currentUser.id, n.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Governance &amp; Financial Notifications</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on approvals, contributions, bill due dates, and workspace security events.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-700">No notifications in your inbox</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All financial responsibilities are up to date.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition text-xs flex items-start gap-3.5 ${
                n.read_at
                  ? 'bg-white border-slate-200 text-slate-600'
                  : 'bg-blue-50/60 border-blue-200 text-slate-900 font-medium'
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
