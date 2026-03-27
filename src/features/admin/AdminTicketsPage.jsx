// src/features/admin/AdminTicketsPage.jsx
import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { subscribeTickets, replyTicket, getAllUsers } from '../../firebase/firestoreService';
import { formatDateTime } from '../../utils/helpers';
import { Badge, PageHeader, Modal, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState({});
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeTickets(null, setTickets);
    getAllUsers().then(list => {
      const map = {};
      list.forEach(u => { map[u.id] = u; });
      setUsers(map);
    });
    return unsub;
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await replyTicket(selected.id, reply);
      toast.success('Reply sent');
      setSelected(null);
      setReply('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const open = tickets.filter(t => t.status === 'open');
  const answered = tickets.filter(t => t.status !== 'open');

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle={`${open.length} open · ${tickets.length} total`} />

      {open.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Open Tickets ({open.length})
          </h2>
          <div className="space-y-3">
            {open.map(ticket => (
              <TicketRow key={ticket.id} ticket={ticket} user={users[ticket.userId]} onSelect={setSelected} />
            ))}
          </div>
        </div>
      )}

      {answered.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Answered</h2>
          <div className="space-y-2">
            {answered.map(ticket => (
              <TicketRow key={ticket.id} ticket={ticket} user={users[ticket.userId]} onSelect={setSelected} />
            ))}
          </div>
        </div>
      )}

      {tickets.length === 0 && (
        <EmptyState icon={MessageSquare} title="No support tickets" description="User support tickets will appear here." />
      )}

      {/* Reply Modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setReply(''); }} title="Ticket Reply" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge status={selected.status} />
              <span className="text-xs text-slate-500">
                {users[selected.userId]?.name} · {formatDateTime(selected.createdAt)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50">
              <p className="text-sm font-semibold text-slate-300 mb-1">{selected.subject}</p>
              <p className="text-sm text-slate-400">{selected.message}</p>
            </div>
            {selected.reply && (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-xs font-semibold text-green-400 mb-1">Your Reply</p>
                <p className="text-sm text-slate-300">{selected.reply}</p>
              </div>
            )}
            {selected.status === 'open' && (
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  className="input-field resize-none h-28"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading
                    ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    : <><Send size={15} /> Send Reply</>
                  }
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function TicketRow({ ticket, user, onSelect }) {
  return (
    <div
      className="card p-5 cursor-pointer hover:border-slate-700 transition-all"
      onClick={() => onSelect(ticket)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-slate-200">{ticket.subject}</span>
              <Badge status={ticket.status} />
            </div>
            <p className="text-xs text-slate-500">{user?.name || 'Unknown'} · {user?.email}</p>
            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{ticket.message}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 whitespace-nowrap">{formatDateTime(ticket.createdAt)}</p>
      </div>
    </div>
  );
}
