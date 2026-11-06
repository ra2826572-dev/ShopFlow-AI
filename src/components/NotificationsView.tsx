import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC = () => {
  const { data, markNotificationRead } = useApp();
  const notifications = data?.notifications || [];

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Notifications Center</h2>
        <p className="text-sm text-slate-500">Real-time alerts for low stock, orders, payments, and business activity.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${!n.read ? 'bg-purple-50/40' : ''}`}
          >
            <div className="mt-1 shrink-0">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                <span className="text-xs text-slate-400">{n.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
            </div>
            {!n.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 self-center"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
