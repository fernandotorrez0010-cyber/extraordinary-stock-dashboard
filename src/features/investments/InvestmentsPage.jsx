// src/features/investments/InvestmentsPage.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, Percent, CheckCircle } from 'lucide-react';
import {
  subscribePlans, subscribeInvestments, createInvestment
} from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Modal, Badge, PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

function PlanCard({ plan, onInvest }) {
  return (
    <div className="card p-6 flex flex-col gap-4 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-green-500/10">
          <TrendingUp size={20} className="text-green-400" />
        </div>
        <Badge status={plan.status} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
        <p className="text-xs text-slate-500 mt-1">Investment plan</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-1">Min Amount</p>
          <p className="font-bold text-slate-200 text-sm font-mono">{formatCurrency(plan.minAmount)}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-1">Max Amount</p>
          <p className="font-bold text-slate-200 text-sm font-mono">{formatCurrency(plan.maxAmount)}</p>
        </div>
        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
          <p className="text-xs text-slate-500 mb-1">ROI</p>
          <p className="font-bold text-green-400 text-lg font-mono">{plan.roiPercent}%</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-1">Duration</p>
          <p className="font-bold text-slate-200 text-sm">{plan.durationDays} days</p>
        </div>
      </div>
      {plan.status === 'active' && (
        <button onClick={() => onInvest(plan)} className="btn-primary w-full mt-1">
          Invest Now
        </button>
      )}
    </div>
  );
}

export default function InvestmentsPage() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('plans');

  useEffect(() => {
    const u1 = subscribePlans(setPlans);
    if (!profile?.uid) return;
    const u2 = subscribeInvestments(profile.uid, setInvestments);
    return () => { u1(); u2(); };
  }, [profile?.uid]);

  const handleInvest = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast.error('Enter a valid amount');
    if (amt < modal.minAmount) return toast.error(`Minimum is ${formatCurrency(modal.minAmount)}`);
    if (amt > modal.maxAmount) return toast.error(`Maximum is ${formatCurrency(modal.maxAmount)}`);
    if (amt > (profile?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      await createInvestment(profile.uid, modal.id, amt, modal);
      toast.success('Investment created successfully!');
      setModal(null);
      setAmount('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const active = investments.filter(i => i.status === 'active');
  const completed = investments.filter(i => i.status === 'completed');

  return (
    <div>
      <PageHeader
        title="Investment Plans"
        subtitle="Choose a plan and start earning"
      />

      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-6">
        {['plans', 'active', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t} {t === 'active' && active.length > 0 && `(${active.length})`}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          {plans.filter(p => p.status === 'active').length === 0 ? (
            <EmptyState icon={TrendingUp} title="No plans available" description="Investment plans will appear here when published." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.filter(p => p.status === 'active').map(plan => (
                <PlanCard key={plan.id} plan={plan} onInvest={setModal} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'active' && (
        <>
          {active.length === 0 ? (
            <EmptyState icon={Clock} title="No active investments" description="Invest in a plan to see it here." />
          ) : (
            <div className="space-y-3">
              {active.map(inv => (
                <div key={inv.id} className="card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-100">{inv.planName}</h3>
                        <Badge status={inv.status} />
                      </div>
                      <p className="text-xs text-slate-500">Started {formatDate(inv.startDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400 font-mono">{formatCurrency(inv.profit)}</p>
                      <p className="text-xs text-slate-500">Profit earned</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                      <p className="text-xs text-slate-500">Invested</p>
                      <p className="font-bold text-slate-200 text-sm font-mono mt-1">{formatCurrency(inv.amount)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                      <p className="text-xs text-slate-500">ROI</p>
                      <p className="font-bold text-green-400 text-sm mt-1">{inv.roiPercent}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                      <p className="text-xs text-slate-500">Ends</p>
                      <p className="font-bold text-slate-200 text-sm mt-1">{formatDate(inv.endDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'completed' && (
        <>
          {completed.length === 0 ? (
            <EmptyState icon={CheckCircle} title="No completed investments" description="Completed investments will appear here." />
          ) : (
            <div className="space-y-3">
              {completed.map(inv => (
                <div key={inv.id} className="card p-5 opacity-80">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-200">{inv.planName}</h3>
                        <Badge status={inv.status} />
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(inv.startDate)} → {formatDate(inv.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400 font-mono">{formatCurrency(inv.profit)}</p>
                      <p className="text-xs text-slate-500">Total profit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invest Modal */}
      <Modal open={!!modal} onClose={() => { setModal(null); setAmount(''); }} title={`Invest in ${modal?.name}`}>
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-xs text-slate-500">Min</p>
                <p className="font-bold text-slate-200 font-mono">{formatCurrency(modal.minAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Max</p>
                <p className="font-bold text-slate-200 font-mono">{formatCurrency(modal.maxAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ROI</p>
                <p className="font-bold text-green-400">{modal.roiPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="font-bold text-slate-200">{modal.durationDays} days</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
              Available balance: <span className="font-bold font-mono">{formatCurrency(profile?.balance)}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Amount to Invest</label>
              <input type="number" className="input-field" placeholder="Enter amount"
                value={amount} onChange={e => setAmount(e.target.value)} min={modal.minAmount} max={modal.maxAmount} />
            </div>
            <button onClick={handleInvest} disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : 'Confirm Investment'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
