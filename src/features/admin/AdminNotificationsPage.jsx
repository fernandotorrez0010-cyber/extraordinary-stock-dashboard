// src/features/admin/AdminNotificationsPage.jsx
import { useState, useEffect } from 'react';
import { Bell, Send, Users } from 'lucide-react';
import { sendNotification, getAllUsers } from '../../firebase/firestoreService';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', userId: 'all' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState([]);

  useEffect(() => { getAllUsers().then(setUsers); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await sendNotification(form);
      toast.success(form.userId === 'all' ? 'Notification sent to all users!' : 'Notification sent!');
      setSent(prev => [{ ...form, sentAt: new Date().toISOString() }, ...prev]);
      setForm(p => ({ ...p, title: '', message: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Send Notifications" subtitle="Broadcast messages to users" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <Bell size={18} className="text-blue-400" />
            Compose Notification
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Send To</label>
              <select className="input-field" value={form.userId}
                onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                <option value="all">All Users ({users.length})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Title</label>
              <input className="input-field" placeholder="e.g. New Investment Plan Available"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
              <textarea className="input-field resize-none h-32"
                placeholder="Write your message here..."
                value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 flex-shrink-0">
                    <Bell size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{form.title || 'Title...'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{form.message || 'Message...'}</p>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                : <><Send size={16} /> Send Notification</>
              }
            </button>
          </form>
        </div>

        {/* Recent sent */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <Users size={18} className="text-green-400" />
            Recently Sent
          </h2>
          {sent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell size={28} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">No notifications sent this session</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sent.map((n, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-200">{n.title}</p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {n.userId === 'all' ? 'All users' : 'Specific user'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
