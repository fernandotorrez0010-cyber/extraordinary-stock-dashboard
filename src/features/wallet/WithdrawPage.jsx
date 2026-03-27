// src/features/wallet/WithdrawPage.jsx
import { useState } from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestWithdrawal } from '../../firebase/firestoreService';
import { formatCurrency } from '../../utils/helpers';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const METHODS = ['Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT TRC-20'];

export default function WithdrawPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ amount: '', method: METHODS[0], details: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > (profile?.balance || 0)) return toast.error('Insufficient balance');
    if (amt < 10) return toast.error('Minimum withdrawal is $10');
    if (!form.details.trim()) return toast.error('Enter your wallet address or bank details');
    setLoading(true);
    try {
      await requestWithdrawal(profile.uid, amt, form.method, form.details);
      toast.success('Withdrawal request submitted! Pending admin approval.');
      setForm({ amount: '', method: METHODS[0], details: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Withdraw Funds" subtitle="Request a withdrawal to your wallet or bank" />

      <div className="max-w-lg">
        {/* Balance */}
        <div className="card p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Available Balance</p>
            <p className="text-3xl font-bold text-green-400 font-mono mt-1">
              {formatCurrency(profile?.balance || 0)}
            </p>
          </div>
          <ArrowUpCircle size={32} className="text-orange-400 opacity-60" />
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Amount (USD)</label>
              <div className="relative">
                <input type="number" className="input-field pr-20" placeholder="0.00"
                  value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="10" />
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, amount: profile?.balance?.toString() || '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-400 hover:text-green-300">
                  MAX
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Minimum: $10</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Withdrawal Method</label>
              <select className="input-field" value={form.method}
                onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                {form.method.includes('Bank') ? 'Bank Account Details' : 'Wallet Address'}
              </label>
              <textarea className="input-field resize-none h-24"
                placeholder={form.method.includes('Bank')
                  ? 'Bank name, account number, sort code...'
                  : 'Your wallet address'}
                value={form.details}
                onChange={e => setForm(p => ({ ...p, details: e.target.value }))} required />
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 space-y-1">
              <p>⚠️ Withdrawals are processed within 24–48 business hours.</p>
              <p>Double-check your wallet address. Incorrect addresses cannot be recovered.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                : <><ArrowUpCircle size={17} /> Request Withdrawal</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
