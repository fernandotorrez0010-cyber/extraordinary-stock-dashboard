// src/features/notifications/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markAllRead, markNotificationRead } from '../../firebase/firestoreService';
import { formatDateTime } from '../../utils/helpers';
import { PageHeader, EmptyState } from '../../components/ui';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = getUserNotifications(profile.uid, setNotifications);
    return unsub;
  }, [profile?.uid]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        action={unread > 0 && (
          <button onClick={() => markAllRead(profile.uid)}
            className="btn-secondary text-sm gap-2 py-2">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You'll see platform updates and alerts here." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              onClick={() => !n.read && markNotificationRead(n.id)}
              className={`card p-4 cursor-pointer transition-all hover:border-slate-700 ${!n.read ? 'border-green-500/20 bg-green-500/[0.02]' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-slate-700' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>{n.title}</p>
                    <p className="text-xs text-slate-600 flex-shrink-0">{formatDateTime(n.date)}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
