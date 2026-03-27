// src/features/auth/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ArrowRight } from 'lucide-react';
import { loginUser } from '../../firebase/authService';
import { getUserProfile } from '../../firebase/authService';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await loginUser(form.email, form.password);
      const profile = await getUserProfile(cred.user.uid);
      if (profile?.isBlocked) {
        toast.error('Your account has been suspended. Contact support.');
        setLoading(false);
        return;
      }
      toast.success('Welcome back!');
      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-[#0a0c12] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <img src='/logo.png' alt='logo' height={250} width={250}/>
          </div>
          <h2 className="text-4xl font-bold text-slate-100 leading-tight mb-4">
            Your money,<br />
            <span className="text-green-400">professionally managed.</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            We trade on your behalf. Watch your portfolio grow with expert-managed investments.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Investors', value: '12,400+' },
              { label: 'Avg. Monthly ROI', value: '8.4%' },
              { label: 'Assets Managed', value: '$48M+' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <p className="text-xl font-bold text-green-400 font-mono">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 bg-[#0d1018]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <TrendingUp size={22} className="text-green-400" />
            <span className="font-bold text-lg">TradePro</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-green-400 hover:text-green-300">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
