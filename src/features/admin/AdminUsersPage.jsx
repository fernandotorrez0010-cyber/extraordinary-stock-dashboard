// src/features/admin/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Edit, Ban, DollarSign } from 'lucide-react';
import { getAllUsers, updateUser, assignProfit } from '../../firebase/firestoreService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Modal, Badge, PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [profitModal, setProfitModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [profitAmt, setProfitAmt] = useState('');

  const loadUsers = () => getAllUsers().then(setUsers);
  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(editModal.uid, { name: form.name, balance: parseFloat(form.balance), role: form.role });
      toast.success('User updated');
      setEditModal(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (user) => {
    await updateUser(user.uid, { isBlocked: !user.isBlocked });
    toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
    loadUsers();
  };

  const handleAssignProfit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(profitAmt);
    if (isNaN(amt) || amt <= 0) return toast.error('Enter valid amount');
    setLoading(true);
    try {
      await assignProfit(profitModal.uid, amt);
      toast.success(`$${amt} profit assigned to ${profitModal.name}`);
      setProfitModal(null);
      setProfitAmt('');
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Manage Users" subtitle={`${users.length} total users`} />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input-field pl-9" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['User', 'Balance', 'Profit', 'Invested', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-800/60 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        {u.isBlocked && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Blocked</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-green-400">{formatCurrency(u.balance || 0)}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-400">{formatCurrency(u.profit || 0)}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{formatCurrency(u.totalInvested || 0)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${u.role === 'admin' ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditModal(u); setForm({ name: u.name, balance: u.balance, role: u.role }); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setProfitModal(u)}
                        className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors" title="Assign Profit">
                        <DollarSign size={14} />
                      </button>
                      <button onClick={() => handleBlock(u)}
                        className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-red-500/20 text-red-400'}`}
                        title={u.isBlocked ? 'Unblock' : 'Block'}>
                        <Ban size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.name}`}>
        {editModal && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Balance (USD)</label>
              <input type="number" className="input-field" value={form.balance}
                onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>

      {/* Assign profit modal */}
      <Modal open={!!profitModal} onClose={() => setProfitModal(null)} title={`Assign Profit to ${profitModal?.name}`}>
        {profitModal && (
          <form onSubmit={handleAssignProfit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-sm text-slate-400">
              Current Balance: <span className="font-bold text-green-400 font-mono">{formatCurrency(profitModal.balance)}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Profit Amount (USD)</label>
              <input type="number" className="input-field" placeholder="Enter profit amount"
                value={profitAmt} onChange={e => setProfitAmt(e.target.value)} required min="0.01" step="0.01" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : 'Assign Profit'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
