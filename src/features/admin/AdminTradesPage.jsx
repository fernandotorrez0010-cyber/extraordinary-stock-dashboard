// src/features/admin/AdminTradesPage.jsx
import { useState, useEffect } from 'react';
import { BarChart2, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { subscribeTrades, createTrade, updateTrade, deleteTrade, uploadFile } from '../../firebase/firestoreService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Modal, Badge, PageHeader, ConfirmDialog, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const emptyForm = {
  symbol: '', type: 'buy', entryPrice: '', exitPrice: '',
  lotSize: '', profit: '', status: 'closed', date: '', imageFile: null
};

export default function AdminTradesPage() {
  const [trades, setTrades] = useState([]);
  const [modal, setModal] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { const unsub = subscribeTrades(setTrades); return unsub; }, []);

  const openCreate = () => { setForm(emptyForm); setEditTrade(null); setModal(true); };
  const openEdit = (t) => {
    setEditTrade(t);
    setForm({ ...t, imageFile: null, date: t.date?.toDate?.().toISOString().slice(0,10) || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = editTrade?.imageUrl || '';
      if (form.imageFile) {
        imageUrl = await uploadFile(form.imageFile, `trades/${Date.now()}`);
      }
      const data = {
        symbol: form.symbol.toUpperCase(),
        type: form.type,
        entryPrice: parseFloat(form.entryPrice),
        exitPrice: parseFloat(form.exitPrice),
        lotSize: parseFloat(form.lotSize),
        profit: parseFloat(form.profit),
        status: form.status,
        date: form.date ? new Date(form.date) : new Date(),
        imageUrl,
      };
      if (editTrade) {
        await updateTrade(editTrade.id, data);
        toast.success('Trade updated');
      } else {
        await createTrade(data);
        toast.success('Trade created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteTrade(deleteId);
    toast.success('Trade deleted');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Manage Trades"
        subtitle={`${trades.length} trades`}
        action={<button onClick={openCreate} className="btn-primary"><Plus size={17} /> Add Trade</button>}
      />

      {trades.length === 0 ? (
        <EmptyState icon={BarChart2} title="No trades yet" description="Add trades to display them to users." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Symbol', 'Type', 'Entry', 'Exit', 'Lot', 'P&L', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 font-bold text-slate-100">{t.symbol}</td>
                    <td className="px-4 py-3.5"><Badge status={t.type} /></td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{formatCurrency(t.entryPrice)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{formatCurrency(t.exitPrice)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{t.lotSize}</td>
                    <td className={`px-4 py-3.5 font-bold font-mono ${(t.profit||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(t.profit||0) >= 0 ? '+' : ''}{formatCurrency(t.profit||0)}
                    </td>
                    <td className="px-4 py-3.5"><Badge status={t.status} /></td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"><Edit size={13} /></button>
                        <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editTrade ? 'Edit Trade' : 'Add Trade'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Symbol</label>
            <input className="input-field" placeholder="EURUSD, BTC/USD" value={form.symbol}
              onChange={e => setForm(p => ({ ...p, symbol: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Entry Price</label>
            <input type="number" step="any" className="input-field" placeholder="0.00" value={form.entryPrice}
              onChange={e => setForm(p => ({ ...p, entryPrice: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Exit Price</label>
            <input type="number" step="any" className="input-field" placeholder="0.00" value={form.exitPrice}
              onChange={e => setForm(p => ({ ...p, exitPrice: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Lot Size</label>
            <input type="number" step="any" className="input-field" placeholder="0.01" value={form.lotSize}
              onChange={e => setForm(p => ({ ...p, lotSize: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Profit/Loss (USD)</label>
            <input type="number" step="any" className="input-field" placeholder="e.g. 250 or -80" value={form.profit}
              onChange={e => setForm(p => ({ ...p, profit: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
            <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" className="input-field" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Chart Image (optional)</label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 bg-slate-800/30">
              <input type="file" className="hidden" accept="image/*"
                onChange={e => setForm(p => ({ ...p, imageFile: e.target.files[0] }))} />
              <Upload size={16} className="text-slate-500" />
              <span className="text-sm text-slate-500">{form.imageFile?.name || 'Upload chart screenshot'}</span>
            </label>
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : editTrade ? 'Update Trade' : 'Add Trade'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Trade" message="This will permanently delete this trade." />
    </div>
  );
}
