// src/features/dashboard/DashboardHome.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, BarChart2, Activity,
  ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeTransactions, subscribeInvestments, subscribeTrades
} from '../../firebase/firestoreService';
import { formatCurrency, formatDateTime, statusColor } from '../../utils/helpers';
import { StatCard, Badge } from '../../components/ui';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 shadow-xl border-slate-700 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-green-400">{formatCurrency(payload[0]?.value)}</p>
    </div>
  );
};

export default function DashboardHome() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const u1 = subscribeTransactions(profile.uid, setTransactions);
    const u2 = subscribeInvestments(profile.uid, setInvestments);
    const u3 = subscribeTrades(setTrades);
    return () => { u1(); u2(); u3(); };
  }, [profile?.uid]);

  // Build profit chart data from transactions (last 7 days)
  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayTxs = transactions.filter(tx => {
        const txDate = tx.createdAt?.toDate?.() || new Date(tx.createdAt);
        return txDate.toDateString() === d.toDateString() && tx.type === 'profit';
      });
      const amount = dayTxs.reduce((s, t) => s + (t.amount || 0), 0);
      days.push({ day: label, profit: amount });
    }
    return days;
  })();

  const activeInvestment = investments.find(i => i.status === 'active');
  const recentTrades = trades.slice(0, 5);
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="gradient-border rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Good day,</p>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
            {profile?.name} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here's your portfolio overview
          </p>
        </div>
        <Link
          to="/deposit"
          className="btn-primary text-sm py-2.5 px-5 hidden sm:flex"
        >
          Add Funds <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Balance"
          color="green"
          value={formatCurrency(profile?.balance || 0)}
          sub="Available to withdraw"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Profit"
          color="blue"
          value={formatCurrency(profile?.profit || 0)}
          sub="All time earnings"
        />
        <StatCard
          icon={BarChart2}
          label="Total Invested"
          color="purple"
          value={formatCurrency(profile?.totalInvested || 0)}
          sub="Cumulative deposits"
        />
        <StatCard
          icon={Activity}
          label="Active Plan"
          color="orange"
          value={activeInvestment ? activeInvestment.planName : "None"}
          sub={
            activeInvestment
              ? `${formatCurrency(activeInvestment.amount)} invested`
              : "Invest to start earning"
          }
        />
      </div>

      {/* Chart + Active Investment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-200">Profit Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.07)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#profitGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">
            Active Investment
          </h3>
          {activeInvestment ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-lg font-bold text-green-400">
                  {activeInvestment.planName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Current plan</p>
              </div>
              {[
                {
                  label: "Amount",
                  value: formatCurrency(activeInvestment.amount),
                },
                { label: "ROI", value: `${activeInvestment.roiPercent}%` },
                {
                  label: "Profit Earned",
                  value: formatCurrency(activeInvestment.profit),
                },
                {
                  label: "Status",
                  value: <Badge status={activeInvestment.status} />,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 rounded-2xl bg-slate-800/50 mb-3">
                <TrendingUp size={24} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 mb-4">
                No active investment
              </p>
              <Link to="/investments" className="btn-primary text-sm py-2">
                Browse Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">Recent Trades</h3>
            <Link
              to="/trades"
              className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentTrades.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No trades yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${trade.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"}`}
                    >
                      {trade.type === "buy" ? (
                        <ArrowUpRight size={14} className="text-green-400" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {trade.symbol}
                      </p>
                      <Badge status={trade.type} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${(trade.profit || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {(trade.profit || 0) >= 0 ? "+" : ""}
                      {formatCurrency(trade.profit || 0)}
                    </p>
                    <p className="text-xs text-slate-500">{trade.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentTxs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200 capitalize">
                      {tx.type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-200">
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
    </div>
  );
}
