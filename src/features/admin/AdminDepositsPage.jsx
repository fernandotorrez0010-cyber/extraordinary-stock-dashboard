// src/features/admin/AdminDepositsPage.jsx
import { useState, useEffect } from 'react';
import { ArrowDownCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { subscribeTransactions, updateTransaction } from '../../firebase/firestoreService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Badge, PageHeader, Modal, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    const unsub = subscribeTransactions(null, (txs) => {
      setDeposits(txs.filter(t => t.type === 'deposit'));
    });
    return unsub;
  }, []);

  const handleAction = async (id, status) => {
    setLoading(id + status);
    try {
      await updateTransaction(id, { status });
      toast.success(`Deposit ${status}`);
      setSelected(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  };

  const pending = deposits.filter(d => d.status === 'pending');
  const processed = deposits.filter(d => d.status !== 'pending');

  return (
    <div>
      <PageHeader
        title="Deposit Requests"
        subtitle={`${pending.length} pending · ${deposits.length} total`}
      />

      {/* Pending first */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(tx => (
              <DepositRow key={tx.id} tx={tx} onView={setSelected} onAction={handleAction} loading={loading} />
            ))}
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">History</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['User', 'Amount', 'Method', 'Status', 'Date', 'Proof'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processed.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 text-slate-300 text-xs font-mono">{tx.userId?.slice(0, 8)}...</td>
                      <td className="px-4 py-3.5 font-bold text-green-400 font-mono">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{tx.method}</td>
                      <td className="px-4 py-3.5"><Badge status={tx.status} /></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        {tx.proofUrl && (
                          <a href={tx.proofUrl} target="_blank" rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                            <Eye size={12} /> View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {deposits.length === 0 && (
        <EmptyState icon={ArrowDownCircle} title="No deposit requests" description="User deposit requests will appear here." />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Deposit Request Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Amount', value: formatCurrency(selected.amount) },
                { label: 'Method', value: selected.method },
                { label: 'Reference', value: selected.reference },
                { label: 'Date', value: formatDateTime(selected.createdAt) },
                { label: 'User ID', value: selected.userId?.slice(0, 12) + '...' },
                { label: 'Status', value: <Badge status={selected.status} /> },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="font-semibold text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            {selected.proofUrl && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Payment Proof</p>
                <img src={selected.proofUrl} alt="proof" className="w-full rounded-xl border border-slate-800 max-h-64 object-contain" />
              </div>
            )}
            {selected.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  disabled={loading === selected.id + 'approved'}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                  <CheckCircle size={17} /> Approve
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  disabled={loading === selected.id + 'rejected'}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-colors border border-red-500/30 disabled:opacity-50">
                  <XCircle size={17} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function DepositRow({ tx, onView, onAction, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-100 text-lg font-mono">{formatCurrency(tx.amount)}</span>
            <Badge status={tx.status} />
          </div>
          <p className="text-xs text-slate-500">{tx.method} · {tx.reference}</p>
          <p className="text-xs text-slate-600">{formatDateTime(tx.createdAt)}</p>
          <p className="text-xs text-slate-600 font-mono mt-0.5">User: {tx.userId?.slice(0, 16)}...</p>
        </div>
        <div className="flex gap-2">
          {tx.proofUrl && (
            <button onClick={() => onView(tx)} className="btn-secondary text-sm py-2 px-3 gap-1.5">
              <Eye size={14} /> Proof
            </button>
          )}
          <button
            onClick={() => onAction(tx.id, 'approved')}
            disabled={loading === tx.id + 'approved'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/20 transition-colors disabled:opacity-50">
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={() => onAction(tx.id, 'rejected')}
            disabled={loading === tx.id + 'rejected'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20 transition-colors disabled:opacity-50">
            <XCircle size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
