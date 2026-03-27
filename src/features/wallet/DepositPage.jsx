// src/features/wallet/DepositPage.jsx
import { useState } from 'react';
import { ArrowDownCircle, Copy, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTransaction } from '../../firebase/firestoreService';
import { uploadToCloudinary } from '../../utils/cloudinaryService';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'btc', label: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin Network' },
  { id: 'eth', label: 'Ethereum (ETH)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { id: 'usdt', label: 'USDT (TRC-20)', address: 'TJmBdXNjRD6sRvLBMz6bQHo7Yh9r8k4kzS', network: 'TRON Network' },
];

export default function DepositPage() {
  const { profile } = useAuth();
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(method.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast.error('Enter a valid amount');
    if (!proof) return toast.error('Please upload payment proof');
    setLoading(true);
    try {
      const proofUrl = await uploadToCloudinary(proof, `deposits/${profile.uid}`);
      await createTransaction({
        userId: profile.uid,
        type: 'deposit',
        amount: amt,
        method: method.label,
        proofUrl,
        status: 'pending',
      });
      toast.success('Deposit request submitted! Awaiting admin approval.');
      setAmount('');
      setProof(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Deposit Funds" subtitle="Send funds and submit proof of payment" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment details */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-4">1. Choose Payment Method</h2>
          <div className="space-y-2 mb-6">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  method.id === m.id
                    ? 'border-green-500/40 bg-green-500/5 text-slate-200'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}>
                <div className={`w-3 h-3 rounded-full border-2 ${method.id === m.id ? 'border-green-400 bg-green-400' : 'border-slate-600'}`} />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          <h2 className="font-semibold text-slate-200 mb-3">2. Send to this address</h2>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <p className="text-xs text-slate-500 mb-2">{method.network}</p>
            <p className="text-sm text-slate-200 font-mono break-all leading-relaxed">{method.address}</p>
            <button onClick={copy}
              className="flex items-center gap-2 text-xs font-semibold mt-3 text-green-400 hover:text-green-300 transition-colors">
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>
          </div>
        </div>

        {/* Submit form */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-4">3. Submit Proof of Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Amount Sent (USD)</label>
              <input type="number" className="input-field" placeholder="e.g. 500"
                value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Payment Proof (screenshot)</label>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                proof ? 'border-green-500/40 bg-green-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
              }`}>
                <input type="file" className="hidden" accept="image/*"
                  onChange={e => setProof(e.target.files[0])} />
                {proof ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">{proof.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload size={22} />
                    <span className="text-sm">Click to upload proof</span>
                    <span className="text-xs">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </label>
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
              ⚠️ Your deposit will be reviewed and credited within 24 hours after confirmation.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : (
                <><ArrowDownCircle size={17} /> Submit Deposit</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
