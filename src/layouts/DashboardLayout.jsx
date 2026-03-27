// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MarketTicker from '../components/layout/MarketTicker';

const titles = {
  '/dashboard': 'Overview',
  '/dashboard/investments': 'Investments',
  '/dashboard/trades': 'Trade History',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/deposit': 'Deposit Funds',
  '/dashboard/withdraw': 'Withdraw Funds',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/referral': 'Referral Program',
  '/dashboard/profile': 'My Profile',
  '/dashboard/kyc': 'KYC Verification',
  '/dashboard/tickets': 'Support Tickets',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/markets': 'Live Markets',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrolling market ticker */}
        <MarketTicker />
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
