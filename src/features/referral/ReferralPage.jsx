// src/features/referral/ReferralPage.jsx
import { useState, useEffect } from 'react';
import { Gift, Copy, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReferrals } from '../../firebase/firestoreService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.uid) getReferrals(profile.uid).then(setReferrals);
  }, [profile?.uid]);

  const referralLink = `${window.location.origin}/register?ref=${profile?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(profile?.referralCode || '');
    toast.success('Referral code copied!');
  };

  return (
    <div>
      <PageHeader title="Referral Program" subtitle="Invite friends and earn bonuses" />

      {/* Banner */}
      <div className="gradient-border rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Gift size={22} className="text-green-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100">Earn with Referrals</h2>
              <p className="text-xs text-slate-400">Get rewarded for every friend you bring</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-lg">
            Share your referral link with friends. When they register and make their first investment, you both earn a bonus. The more you refer, the more you earn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Referral code */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700 font-mono text-2xl font-bold text-green-400 tracking-widest text-center">
              {profile?.referralCode || '—'}
            </div>
            <button onClick={copyCode} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
              <Copy size={17} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Referral link */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Referral Link</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-400 truncate font-mono">
              {referralLink}
            </div>
            <button onClick={copyLink} className="p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors border border-green-500/20">
              {copied ? <CheckCircle size={17} className="text-green-400" /> : <Copy size={17} className="text-green-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-slate-100 font-mono">{referrals.length}</p>
          <p className="text-sm text-slate-500 mt-1">Total Referrals</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-green-400 font-mono">
            {formatCurrency(referrals.reduce((s, r) => s + (r.bonus || 0), 0))}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Earned</p>
        </div>
      </div>

      {/* Referrals list */}
      <h3 className="font-semibold text-slate-300 mb-3">Referral History</h3>
      {referrals.length === 0 ? (
        <EmptyState icon={Users} title="No referrals yet" description="Share your link to start earning bonuses." />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Users size={15} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{r.referredEmail || r.referredUserId}</p>
                    <p className="text-xs text-slate-500">{formatDate(r.date)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400 font-mono">+{formatCurrency(r.bonus || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
