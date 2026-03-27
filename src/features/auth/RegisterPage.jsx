// src/features/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { registerUser } from '../../firebase/authService';
import toast from 'react-hot-toast';

const perks = [
  'Expert-managed trading on your behalf',
  'Multiple investment plans available',
  'Real-time profit tracking',
  'Secure withdrawals anytime',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '',
    password: '', confirm: '',
    referral: params.get('ref') || '',
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to TradePro.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already registered' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-[#0a0c12] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="logo" height={250} width={250} />
          </div>
          <h2 className="text-4xl font-bold text-slate-100 leading-tight mb-6">
            Start earning
            <br />
            <span className="text-green-400">from day one.</span>
          </h2>
          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle
                  size={18}
                  className="text-green-400 flex-shrink-0"
                />
                <span className="text-slate-400 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 bg-[#0d1018]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="logo" height={250} width={250} />
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            Create account
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Start your investment journey today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="input-field pr-11"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirm: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Referral Code (optional)
              </label>
              <input
                className="input-field"
                placeholder="XXXXXXXX"
                value={form.referral}
                onChange={(e) =>
                  setForm((p) => ({ ...p, referral: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
