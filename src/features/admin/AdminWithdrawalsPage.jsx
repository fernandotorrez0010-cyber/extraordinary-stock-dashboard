// src/features/admin/AdminWithdrawalsPage.jsx
import { useState, useEffect } from 'react';
import { ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';
import { subscribeTransactions, updateTransaction } from '../../firebase/firestoreService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Badge, PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    const unsub = subscribeTransactions(null, (txs) => {
      setWithdrawals(txs.filter(t => t.type === 'withdraw'));
    });
    return unsub;
  }, []);

  const handleAction = async (tx, status) => {
    setLoading(tx.id + status);
    try {
      await updateTransaction(tx.id, { status });
      toast.success(`Withdrawal ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const processed = withdrawals.filter(w => w.status !== 'pending');

  return (
    <div>
      <PageHeader
        title="Withdrawal Requests"
        subtitle={`${pending.length} pending · ${withdrawals.length} total`}
      />

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(tx => (
              <div key={tx.id} className="card p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-slate-100 font-mono">{formatCurrency(tx.amount)}</span>
                      <Badge status={tx.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>Method: <span className="text-slate-300">{tx.method}</span></span>
                      <span>Ref: <span className="text-slate-300 font-mono">{tx.reference}</span></span>
                      <span>User: <span className="text-slate-300 font-mono">{tx.userId?.slice(0, 14)}...</span></span>
                      <span>{formatDateTime(tx.createdAt)}</span>
                    </div>
                    {tx.details && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-800/60 text-xs text-slate-400 font-mono break-all">
                        <span className="text-slate-500 block mb-1">Withdrawal destination:</span>
                        {tx.details}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(tx, 'approved')}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/20 transition-colors disabled:opacity-50">
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(tx, 'rejected')}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20 transition-colors disabled:opacity-50">
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              </div>
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
                    {['User', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processed.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">{tx.userId?.slice(0, 10)}...</td>
                      <td className="px-4 py-3.5 font-bold text-orange-400 font-mono">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{tx.method}</td>
                      <td className="px-4 py-3.5"><Badge status={tx.status} /></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {withdrawals.length === 0 && (
        <EmptyState icon={ArrowUpCircle} title="No withdrawal requests" description="User withdrawal requests will appear here." />
      )}
    </div>
  );
}
