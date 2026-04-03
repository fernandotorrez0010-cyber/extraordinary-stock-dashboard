// src/features/admin/AdminTransactionsPage.jsx
import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { subscribeTransactions } from '../../firebase/firestoreService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Badge, PageHeader, EmptyState } from '../../components/ui';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsub = subscribeTransactions(null, setTransactions);
    return unsub;
  }, []);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const totals = {
    deposit: transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0),
    withdraw: transactions.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((s, t) => s + t.amount, 0),
    profit: transactions.filter(t => t.type === 'profit').reduce((s, t) => s + t.amount, 0),
  };

  return (
    <div>
      <PageHeader
        title="All Transactions"
        subtitle={`${transactions.length} total`}
      />

      {/* Totals */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Deposited",
            value: totals.deposit,
            color: "text-blue-400",
          },
          {
            label: "Total Withdrawn",
            value: totals.withdraw,
            color: "text-orange-400",
          },
          {
            label: "Total Profit Assigned",
            value: totals.profit,
            color: "text-green-400",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-xl font-bold font-mono ${color}`}>
              {formatCurrency(value)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-5 flex-wrap">
        {["all", "deposit", "withdraw", "profit", "investment"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-slate-700 text-slate-100"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions"
            description="Transactions will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "User ID",
                    "Type",
                    "Amount",
                    "Method",
                    "Status",
                    "Reference",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-800/60 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">
                      {tx.userId?.slice(0, 10)}...
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={tx.type} />
                    </td>
                    <td className="px-4 py-3.5 font-bold font-mono text-slate-200">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {tx.method || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={tx.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">
                      {tx.reference}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
