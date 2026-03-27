// src/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, BarChart2, ArrowDownCircle,
  ArrowUpCircle, Receipt, FileCheck, MessageSquare, Bell, Shield,
  ChevronLeft, Menu, X, LogOut,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/authService';
import toast from 'react-hot-toast';

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/plans", icon: TrendingUp, label: "Investment Plans" },
  { to: "/admin/investments", icon: BarChart2, label: "Investments" },
  { to: "/admin/trades", icon: BarChart2, label: "Trades" },
  { to: "/admin/deposits", icon: ArrowDownCircle, label: "Deposits" },
  { to: "/admin/crypto-methods", icon: Coins, label: "Deposit Methods" },
  { to: "/admin/withdrawals", icon: ArrowUpCircle, label: "Withdrawals" },
  { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
  { to: "/admin/kyc", icon: FileCheck, label: "KYC" },
  { to: "/admin/tickets", icon: MessageSquare, label: "Tickets" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
];

const titles = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Manage Users',
  '/admin/plans': 'Investment Plans',
  '/admin/investments': 'Investments',
  '/admin/trades': 'Manage Trades',
  '/admin/deposits': 'Deposit Requests',
  '/admin/withdrawals': 'Withdrawal Requests',
  '/admin/transactions': 'All Transactions',
  '/admin/kyc': 'KYC Verification',
  '/admin/tickets': 'Support Tickets',
  '/admin/notifications': 'Send Notifications',
};

function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1018] border-r border-slate-800/60 w-[260px]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <img src='/logo.png' alt='logo' height={180} width={180}/>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="px-4 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {profile?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{profile?.name}</p>
            <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">ADMIN</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {adminNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
              }`
            }
            onClick={onClose}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="pt-2 border-t border-slate-800/60 mt-2">
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-all duration-200">
            <ChevronLeft size={17} />
            <span>User Dashboard</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-3 border-t border-slate-800/60">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Admin';

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#0d1018]/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <h1 className="text-base font-semibold text-slate-200">{title}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
