// src/components/layout/Topbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markAllRead } from '../../firebase/firestoreService';
import { formatDate } from '../../utils/helpers';

export default function Topbar({ onMenuClick, title }) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDrop, setShowDrop] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = getUserNotifications(profile.uid, setNotifications);
    return unsub;
  }, [profile?.uid]);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setShowDrop(v => !v);
  };

  const handleMarkAll = async () => {
    await markAllRead(profile.uid);
  };

  return (
    <header className="h-16 bg-[#0d1018]/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 lg:hidden transition-colors">
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-slate-200 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Balance pill */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
          <span className="text-xs text-slate-500">Balance</span>
          <span className="text-sm font-bold text-green-400 font-mono">
            ${(profile?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={handleOpen}
            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors relative">
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showDrop && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDrop(false)} />
              <div className="absolute right-0 top-12 w-80 card shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <span className="font-semibold text-sm text-slate-200">Notifications</span>
                  {unread > 0 && (
                    <button onClick={handleMarkAll} className="text-xs text-green-400 hover:text-green-300">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.slice(0, 8).length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-green-500/5' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{formatDate(n.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-800">
                  <Link to="/dashboard/notifications" onClick={() => setShowDrop(false)}
                    className="block text-center text-xs text-slate-400 hover:text-slate-200 py-1.5 transition-colors">
                    View all notifications
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <Link to="/dashboard/profile">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm cursor-pointer">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
}
