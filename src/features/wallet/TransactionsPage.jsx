// src/features/wallet/TransactionsPage.jsx
import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { subscribeTransactions } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { PageHeader, Badge, EmptyState } from '../../components/ui';

export default function TransactionsPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeTransactions(profile.uid, setTransactions);
    return unsub;
  }, [profile?.uid]);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Complete history of your account activity" />

      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-5 flex-wrap">
        {['all', 'deposit', 'withdraw', 'profit', 'investment'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" description="Your transaction history will appear here." />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'deposit' ? 'bg-blue-500/10' :
                    tx.type === 'profit' ? 'bg-green-500/10' :
                    tx.type === 'withdraw' ? 'bg-orange-500/10' :
                    'bg-purple-500/10'
                  }`}>
                    <Receipt size={16} className={
                      tx.type === 'deposit' ? 'text-blue-400' :
                      tx.type === 'profit' ? 'text-green-400' :
                      tx.type === 'withdraw' ? 'text-orange-400' :
                      'text-purple-400'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 capitalize">{tx.type}</p>
                    <p className="text-xs text-slate-500">{tx.method} · {tx.reference}</p>
                    <p className="text-xs text-slate-600">{formatDateTime(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold font-mono ${
                    tx.type === 'withdraw' || tx.type === 'investment' ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'withdraw' || tx.type === 'investment' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </p>
                  <Badge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
