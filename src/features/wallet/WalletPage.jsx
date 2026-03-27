// src/features/wallet/WalletPage.jsx
import { Link } from 'react-router-dom';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Receipt, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { PageHeader } from '../../components/ui';

export default function WalletPage() {
  const { profile } = useAuth();

  const actions = [
    {
      to: '/dashboard/deposit',
      icon: ArrowDownCircle,
      label: 'Deposit',
      desc: 'Add funds to your wallet',
      color: 'text-green-400 bg-green-400/10 border-green-400/20',
    },
    {
      to: '/dashboard/withdraw',
      icon: ArrowUpCircle,
      label: 'Withdraw',
      desc: 'Withdraw to your bank/crypto',
      color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    },
    {
      to: '/dashboard/transactions',
      icon: Receipt,
      label: 'Transactions',
      desc: 'View all transaction history',
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    },
    {
      to: '/dashboard/investments',
      icon: TrendingUp,
      label: 'Invest',
      desc: 'Grow your balance with plans',
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    },
  ];

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Manage your funds" />

      {/* Balance card */}
      <div className="gradient-border rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">Total Balance</span>
          </div>
          <p className="text-5xl font-bold text-slate-100 font-mono tracking-tight mb-6">
            {formatCurrency(profile?.balance || 0)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Total Profit</p>
              <p className="text-lg font-bold text-green-400 font-mono">{formatCurrency(profile?.profit || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Invested</p>
              <p className="text-lg font-bold text-slate-200 font-mono">{formatCurrency(profile?.totalInvested || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to}
            className={`card p-5 flex flex-col gap-3 hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div className="card p-5 mt-6 border-yellow-500/20">
        <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <span className="text-yellow-400">⚡</span> Important
        </h3>
        <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Deposits are credited after admin approval</li>
          <li>Withdrawal requests are processed within 24–48 hours</li>
          <li>Profits are credited automatically by the admin</li>
          <li>Minimum withdrawal amount may apply</li>
        </ul>
      </div>
    </div>
  );
}
