// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, BarChart2, Wallet, ArrowDownCircle,
  ArrowUpCircle, Receipt, User, FileCheck, MessageSquare,
  Bell, Gift, LogOut, Shield, X, Globe2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/authService';
import toast from 'react-hot-toast';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/dashboard/trades', icon: BarChart2, label: 'Trades' },
  { to: '/dashboard/markets', icon: Globe2, label: 'Live Markets' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/deposit', icon: ArrowDownCircle, label: 'Deposit' },
  { to: '/dashboard/withdraw', icon: ArrowUpCircle, label: 'Withdraw' },
  { to: '/dashboard/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/dashboard/referral', icon: Gift, label: 'Referral' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const accountNav = [
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/kyc', icon: FileCheck, label: 'KYC Verification' },
  { to: '/dashboard/tickets', icon: MessageSquare, label: 'Support' },
];

export default function Sidebar({ onClose }) {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1018] border-r border-slate-800/60 w-[260px]">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-green-400" />
          </div>
          <span className="text-lg font-bold text-slate-100">Ultimate Global</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Main</p>
        {userNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}>
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Live Markets' && (
              <span className="ml-auto text-[9px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-md border border-green-400/20">
                LIVE
              </span>
            )}
          </NavLink>
        ))}

        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mt-4 mb-2">Account</p>
        {accountNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mt-4 mb-2">Admin</p>
            <NavLink to="/admin"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}>
              <Shield size={17} />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800/60">
        <button onClick={handleLogout}
          className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
