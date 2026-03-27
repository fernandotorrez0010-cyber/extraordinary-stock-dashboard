// src/utils/helpers.js
export const nanoid = (size = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: size }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const formatCurrency = (amount = 0, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const formatDate = (ts) => {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (ts) => {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const statusColor = (status) => {
  const map = {
    active: 'text-green-400 bg-green-400/10',
    completed: 'text-blue-400 bg-blue-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    open: 'text-yellow-400 bg-yellow-400/10',
    answered: 'text-green-400 bg-green-400/10',
    closed: 'text-slate-400 bg-slate-400/10',
    buy: 'text-green-400 bg-green-400/10',
    sell: 'text-red-400 bg-red-400/10',
    profit: 'text-green-400 bg-green-400/10',
    deposit: 'text-blue-400 bg-blue-400/10',
    withdraw: 'text-orange-400 bg-orange-400/10',
    investment: 'text-purple-400 bg-purple-400/10',
  };
  return map[status] || 'text-slate-400 bg-slate-400/10';
};

export const clsx = (...args) => args.filter(Boolean).join(' ');
