// src/features/tickets/TicketsPage.jsx
import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeTickets, createTicket } from '../../firebase/firestoreService';
import { formatDateTime } from '../../utils/helpers';
import { Modal, Badge, PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeTickets(profile.uid, setTickets);
    return unsub;
  }, [profile?.uid]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await createTicket({ userId: profile.uid, ...form });
      toast.success('Ticket created!');
      setShowModal(false);
      setForm({ subject: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="Get help from our support team"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={17} /> New Ticket
          </button>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No tickets yet" description="Create a ticket to get help from our support team." />
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card p-5 cursor-pointer hover:border-slate-700 transition-all"
              onClick={() => setSelected(ticket)}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-200">{ticket.subject}</h3>
                    <Badge status={ticket.status} />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{ticket.message}</p>
                </div>
                <p className="text-xs text-slate-600 flex-shrink-0">{formatDateTime(ticket.createdAt)}</p>
              </div>
              {ticket.reply && (
                <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-xs font-semibold text-green-400 mb-1">Admin Reply</p>
                  <p className="text-sm text-slate-300">{ticket.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create ticket modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Support Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Subject</label>
            <input className="input-field" placeholder="Brief description of your issue"
              value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
            <textarea className="input-field resize-none h-32"
              placeholder="Describe your issue in detail..."
              value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : <><Send size={16} /> Submit Ticket</>}
          </button>
        </form>
      </Modal>

      {/* View ticket modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Ticket Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge status={selected.status} />
              <span className="text-xs text-slate-500">{formatDateTime(selected.createdAt)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1">Subject</p>
              <p className="text-slate-200">{selected.subject}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1">Your Message</p>
              <p className="text-sm text-slate-300 p-3 bg-slate-800/50 rounded-xl">{selected.message}</p>
            </div>
            {selected.reply ? (
              <div>
                <p className="text-sm font-semibold text-green-400 mb-1">Admin Reply</p>
                <p className="text-sm text-slate-300 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">{selected.reply}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Awaiting admin response...</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
