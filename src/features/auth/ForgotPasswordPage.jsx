// src/features/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Send } from 'lucide-react';
import { resetPassword } from '../../firebase/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch {
      toast.error('Could not send reset email. Check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
            <img src='/logo.png' alt='logo' height={250} width={250}/>
          </div>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Send size={28} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check your email</h2>
            <p className="text-slate-500 text-sm mb-6">
              We sent a password reset link to <span className="text-slate-300">{email}</span>
            </p>
            <Link to="/login" className="btn-secondary justify-center w-full">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Reset password</h1>
            <p className="text-slate-500 text-sm mb-8">Enter your email to receive a reset link</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mt-6 justify-center transition-colors">
              <ArrowLeft size={15} /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
