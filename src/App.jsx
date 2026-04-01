// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';

// Auth pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';

// User pages
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './features/dashboard/DashboardHome';
import InvestmentsPage from './features/investments/InvestmentsPage';
import TradesPage from './features/trades/TradesPage';
import WalletPage from './features/wallet/WalletPage';
import DepositPage from './features/wallet/DepositPage';
import WithdrawPage from './features/wallet/WithdrawPage';
import TransactionsPage from './features/wallet/TransactionsPage';
import ReferralPage from './features/referral/ReferralPage';
import ProfilePage from './features/profile/ProfilePage';
import KYCPage from './features/kyc/KYCPage';
import TicketsPage from './features/tickets/TicketsPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import MarketsPage from './features/markets/MarketsPage';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './features/admin/AdminDashboard';
import AdminUsersPage from './features/admin/AdminUsersPage';
import AdminPlansPage from './features/admin/AdminPlansPage';
import AdminInvestmentsPage from './features/admin/AdminInvestmentsPage';
import AdminTradesPage from './features/admin/AdminTradesPage';
import AdminDepositsPage from './features/admin/AdminDepositsPage';
import AdminWithdrawalsPage from './features/admin/AdminWithdrawalsPage';
import AdminTransactionsPage from './features/admin/AdminTransactionsPage';
import AdminKYCPage from './features/admin/AdminKYCPage';
import AdminTicketsPage from './features/admin/AdminTicketsPage';
import AdminNotificationsPage from './features/admin/AdminNotificationsPage';
import AdminCryptoMethodsPage from './features/admin/AdminCryptoMethodsPage';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <BrowserRouter basename="/dashboard">
      <AuthProvider>
        <MarketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1d27",
                color: "#e2e8f0",
                border: "1px solid rgba(148,163,184,0.1)",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#000" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* User dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="investments" element={<InvestmentsPage />} />
              <Route path="trades" element={<TradesPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="deposit" element={<DepositPage />} />
              <Route path="withdraw" element={<WithdrawPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="referral" element={<ReferralPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="markets" element={<MarketsPage />} />
            </Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="investments" element={<AdminInvestmentsPage />} />
              <Route path="trades" element={<AdminTradesPage />} />
              <Route path="deposits" element={<AdminDepositsPage />} />
              <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route path="kyc" element={<AdminKYCPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route
                path="notifications"
                element={<AdminNotificationsPage />}
              />
              <Route
                path="crypto-methods"
                element={<AdminCryptoMethodsPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </MarketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
