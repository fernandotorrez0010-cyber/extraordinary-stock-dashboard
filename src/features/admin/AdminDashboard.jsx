// src/features/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, BarChart2, Clock, ArrowUpRight } from 'lucide-react';
import { getAllUsers, getAllTransactions, getAllInvestments } from '../../firebase/firestoreService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { StatCard, Badge } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllTransactions(), getAllInvestments()])
      .then(([u, t, i]) => { setUsers(u); setTransactions(t); setInvestments(i); })
      .finally(() => setLoading(false));
  }, []);

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'approved')
    .reduce((s, t) => s + t.amount, 0);
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending').length;
  const activeInvestments = investments.filter(i => i.status === 'active').length;

  const recentUsers = users.slice(0, 5);
  const recentTxs = transactions.slice(0, 6);

  // Chart: deposits by day for last 7 days
  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dep = transactions.filter(t => {
        const txDate = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return txDate.toDateString() === d.toDateString() && t.type === 'deposit';
      }).reduce((s, t) => s + t.amount, 0);
      const wit = transactions.filter(t => {
        const txDate = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return txDate.toDateString() === d.toDateString() && t.type === 'withdraw';
      }).reduce((s, t) => s + t.amount, 0);
      days.push({ day: label, deposits: dep, withdrawals: wit });
    }
    return days;
  })();

  if (loading) return <div className="text-slate-500 text-sm">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={users.length} color="blue" />
        <StatCard icon={DollarSign} label="Total Deposits" value={formatCurrency(totalDeposits)} color="green" />
        <StatCard icon={TrendingUp} label="Total Withdrawals" value={formatCurrency(totalWithdrawals)} color="orange" />
        <StatCard icon={BarChart2} label="Active Investments" value={activeInvestments} color="purple"
          sub={`${pendingWithdrawals} withdrawal(s) pending`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Deposits vs Withdrawals (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: '#111318', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="deposits" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              <Bar dataKey="withdrawals" fill="#f97316" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending actions */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending Withdrawals', count: transactions.filter(t => t.type === 'withdraw' && t.status === 'pending').length, color: 'text-orange-400 bg-orange-400/10', link: '/admin/withdrawals' },
              { label: 'Pending Deposits', count: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length, color: 'text-blue-400 bg-blue-400/10', link: '/admin/deposits' },
              { label: 'Pending KYC', count: 0, color: 'text-yellow-400 bg-yellow-400/10', link: '/admin/kyc' },
              { label: 'Open Tickets', count: 0, color: 'text-purple-400 bg-purple-400/10', link: '/admin/tickets' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Recent Users</h3>
          <div className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400 font-mono">{formatCurrency(u.balance)}</p>
                  {u.isBlocked && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Blocked</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {recentTxs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-200 capitalize">{tx.type}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-200 font-mono">{formatCurrency(tx.amount)}</p>
                  <Badge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
