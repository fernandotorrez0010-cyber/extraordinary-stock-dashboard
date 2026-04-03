// src/features/admin/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Edit, Ban, DollarSign, Trash2 } from "lucide-react";
import { getAllUsers, updateUser, assignProfit } from '../../firebase/firestoreService';
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { formatCurrency, formatDate, COUNTRIES } from "../../utils/helpers";
import { Modal, PageHeader, ConfirmDialog } from "../../components/ui";
import toast from 'react-hot-toast';


  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [profitModal, setProfitModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [profitAmt, setProfitAmt] = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const loadUsers = () => getAllUsers().then(setUsers);
  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (u) => {
    setEditModal(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: u.password || "",
      phone: u.phone || "",
      country: u.country || "",
      gender: u.gender || "",
      balance: u.balance ?? 0,
      profit: u.profit ?? 0,
      totalInvested: u.totalInvested ?? 0,
      role: u.role || "user",
      referralCode: u.referralCode || "",
      isBlocked: u.isBlocked || false,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(editModal.uid, {
        name: form.name,
        phone: form.phone,
        country: form.country,
        gender: form.gender,
        password: form.password,
        balance: parseFloat(form.balance) || 0,
        profit: parseFloat(form.profit) || 0,
        totalInvested: parseFloat(form.totalInvested) || 0,
        role: form.role,
        isBlocked: form.isBlocked === true || form.isBlocked === "true",
      });
      toast.success("User updated");
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
    toast.success(user.isBlocked ? "User unblocked" : "User blocked");
    loadUsers();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", deleteId));
      toast.success("User deleted");
      setDeleteId(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProfit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(profitAmt);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter valid amount");
    setLoading(true);
    try {
      await assignProfit(profitModal.uid, amt);
      toast.success(`$${amt} profit assigned to ${profitModal.name}`);
      setProfitModal(null);
      setProfitAmt("");
      loadUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle={`${users.length} total users`}
      />

      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          className="input-field pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  "User",
                  "Balance",
                  "Profit",
                  "Invested",
                  "Country",
                  "Role",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800/60 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          {u.isBlocked && (
                            <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-green-400">
                      {formatCurrency(u.balance || 0)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-blue-400">
                      {formatCurrency(u.profit || 0)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {formatCurrency(u.totalInvested || 0)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {u.country || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`badge ${u.role === "admin" ? "text-blue-400 bg-blue-400/10" : "text-green-400 bg-green-400/10"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setProfitModal(u)}
                          className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                          title="Assign Profit"
                        >
                          <DollarSign size={14} />
                        </button>
                        <button
                          onClick={() => handleBlock(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? "hover:bg-green-500/20 text-green-400" : "hover:bg-orange-500/20 text-orange-400"}`}
                          title={u.isBlocked ? "Unblock" : "Block"}
                        >
                          <Ban size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(u.uid)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={`Edit User — ${editModal?.name}`}
        size="lg"
      >
        {editModal && (
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Read-only info row */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/50 text-xs">
              <div>
                <p className="text-slate-500">UID</p>
                <p className="text-slate-300 font-mono truncate">
                  {editModal.uid}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Referral Code</p>
                <p className="text-slate-300 font-mono">
                  {editModal.referralCode || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Joined</p>
                <p className="text-slate-300">
                  {formatDate(editModal.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="text-slate-300 truncate">{editModal.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  className="input-field"
                  value={form.name}
                  onChange={set("name")}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input-field"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </Field>
              <Field label="Country">
                <select
                  className="input-field"
                  value={form.country}
                  onChange={set("country")}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Gender">
                <select
                  className="input-field"
                  value={form.gender}
                  onChange={set("gender")}
                >
                  <option value="">Select gender…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </Field>
              <Field label="Password">
                <input
                  className="input-field font-mono"
                  placeholder="Stored password"
                  value={form.password}
                  onChange={set("password")}
                />
              </Field>
              <Field label="Role">
                <select
                  className="input-field"
                  value={form.role}
                  onChange={set("role")}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Balance ($)">
                <input
                  type="number"
                  className="input-field"
                  value={form.balance}
                  onChange={set("balance")}
                />
              </Field>
              <Field label="Profit ($)">
                <input
                  type="number"
                  className="input-field"
                  value={form.profit}
                  onChange={set("profit")}
                />
              </Field>
              <Field label="Total Invested ($)">
                <input
                  type="number"
                  className="input-field"
                  value={form.totalInvested}
                  onChange={set("totalInvested")}
                />
              </Field>
              <Field label="Account Status">
                <select
                  className="input-field"
                  value={String(form.isBlocked)}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      isBlocked: e.target.value === "true",
                    }))
                  }
                >
                  <option value="false">Active</option>
                  <option value="true">Blocked</option>
                </select>
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                "Save All Changes"
              )}
            </button>
          </form>
        )}
      </Modal>

      {/* ── Assign Profit Modal ── */}
      <Modal
        open={!!profitModal}
        onClose={() => setProfitModal(null)}
        title={`Assign Profit — ${profitModal?.name}`}
      >
        {profitModal && (
          <form onSubmit={handleAssignProfit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-sm text-slate-400">
              Current Balance:{" "}
              <span className="font-bold text-green-400 font-mono">
                {formatCurrency(profitModal.balance)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Profit Amount (USD)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="Enter profit amount"
                value={profitAmt}
                onChange={(e) => setProfitAmt(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                "Assign Profit"
              )}
            </button>
          </form>
        )}
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={loading}
        title="Delete User"
        message="This will permanently delete the user's Firestore profile. Their Firebase Auth account will remain — delete that manually in the Firebase Console if needed."
      />
    </div>
  );
}