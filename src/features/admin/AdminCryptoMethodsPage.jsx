// src/features/admin/AdminCryptoMethodsPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, CheckCircle } from 'lucide-react';
import {
  subscribeCryptoMethods,
  saveCryptoMethod,
  deleteCryptoMethod,
} from '../../firebase/firestoreService';
import { Modal, PageHeader, ConfirmDialog, EmptyState } from '../../components/ui';
import { Bitcoin } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { label: '', network: '', address: '', status: 'active' };

export default function AdminCryptoMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const unsub = subscribeCryptoMethods(setMethods);
    return unsub;
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setModal(true); };
  const openEdit   = (m) => { setEditItem(m); setForm({ label: m.label, network: m.network, address: m.address, status: m.status }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.address) return toast.error('Label and address are required');
    setLoading(true);
    try {
      await saveCryptoMethod(editItem?.id || null, form);
      toast.success(editItem ? 'Method updated' : 'Method added');
      setModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteCryptoMethod(deleteId);
    toast.success('Method deleted');
    setDeleteId(null);
  };

  const copyAddress = (address, id) => {
    navigator.clipboard.writeText(address);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
    toast.success('Address copied!');
  };

  return (
    <div>
      <PageHeader
        title="Crypto Deposit Methods"
        subtitle="Manage wallet addresses shown to users on the deposit page"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={17} /> Add Method
          </button>
        }
      />

      {methods.length === 0 ? (
        <EmptyState
          icon={Bitcoin}
          title="No crypto methods yet"
          description="Add a wallet address so users can make deposits."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {methods.map(m => (
            <div key={m.id} className="card p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-100">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.network}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${m.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
                    {m.status}
                  </span>
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                <p className="text-xs text-slate-300 font-mono break-all leading-relaxed">{m.address}</p>
                <button
                  onClick={() => copyAddress(m.address, m.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold mt-2 text-green-400 hover:text-green-300 transition-colors">
                  {copied === m.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied === m.id ? 'Copied!' : 'Copy address'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? `Edit: ${editItem.label}` : 'Add Crypto Method'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Coin / Label
            </label>
            <input
              className="input-field"
              placeholder="e.g. Bitcoin (BTC)"
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Network
            </label>
            <input
              className="input-field"
              placeholder="e.g. Bitcoin Network / ERC-20 / TRC-20"
              value={form.network}
              onChange={e => setForm(p => ({ ...p, network: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Wallet Address
            </label>
            <textarea
              className="input-field resize-none h-20 font-mono text-sm"
              placeholder="Paste full wallet address here"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              className="input-field"
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            >
              <option value="active">Active — visible to users</option>
              <option value="inactive">Inactive — hidden from users</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading
              ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              : editItem ? 'Save Changes' : 'Add Method'
            }
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Crypto Method"
        message="This wallet address will no longer appear on the deposit page."
      />
    </div>
  );
}