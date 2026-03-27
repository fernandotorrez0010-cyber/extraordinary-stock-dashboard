// src/features/profile/ProfilePage.jsx
import { useState } from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../firebase/firestoreService';
import { formatDate } from '../../utils/helpers';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(profile.uid, { name: form.name, phone: form.phone });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black text-4xl font-bold mb-4">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="font-bold text-slate-100 text-lg">{profile?.name}</h2>
          <p className="text-slate-500 text-sm">{profile?.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`badge text-xs ${profile?.role === 'admin' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>
              {profile?.role}
            </span>
          </div>

          <div className="w-full mt-6 space-y-3 text-left">
            {[
              { icon: User, label: 'Name', value: profile?.name },
              { icon: Mail, label: 'Email', value: profile?.email },
              { icon: Calendar, label: 'Joined', value: formatDate(profile?.createdAt) },
              { icon: Shield, label: 'KYC Status', value: 'Pending' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <Icon size={15} className="text-slate-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-slate-300 truncate">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-slate-200 mb-5">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input className="input-field" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input className="input-field opacity-60 cursor-not-allowed" value={profile?.email} disabled />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed. Contact support.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input className="input-field" placeholder="+1 234 567 8900" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Referral Code</label>
              <input className="input-field opacity-60 cursor-not-allowed font-mono"
                value={profile?.referralCode || ''} disabled />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
