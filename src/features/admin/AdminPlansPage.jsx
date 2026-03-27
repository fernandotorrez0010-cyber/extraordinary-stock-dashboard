// src/features/admin/AdminPlansPage.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { subscribePlans, createPlan, updatePlan, deletePlan } from '../../firebase/firestoreService';
import { formatCurrency } from '../../utils/helpers';
import { Modal, Badge, PageHeader, ConfirmDialog, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const emptyForm = { name: '', minAmount: '', maxAmount: '', roiPercent: '', durationDays: '', status: 'active' };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [modal, setModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { const unsub = subscribePlans(setPlans); return unsub; }, []);

  const openCreate = () => { setForm(emptyForm); setEditPlan(null); setModal(true); };
  const openEdit = (p) => {
    setEditPlan(p);
    setForm({ name: p.name, minAmount: p.minAmount, maxAmount: p.maxAmount, roiPercent: p.roiPercent, durationDays: p.durationDays, status: p.status });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: form.name,
        minAmount: parseFloat(form.minAmount),
        maxAmount: parseFloat(form.maxAmount),
        roiPercent: parseFloat(form.roiPercent),
        durationDays: parseInt(form.durationDays),
        status: form.status,
      };
      if (editPlan) {
        await updatePlan(editPlan.id, data);
        toast.success('Plan updated');
      } else {
        await createPlan(data);
        toast.success('Plan created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deletePlan(deleteId);
    toast.success('Plan deleted');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Investment Plans"
        subtitle={`${plans.length} plans`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={17} /> New Plan
          </button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No plans yet" description="Create investment plans for users to choose from." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <div key={plan.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-100">{plan.name}</h3>
                  <Badge status={plan.status} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(plan.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Min', value: formatCurrency(plan.minAmount) },
                  { label: 'Max', value: formatCurrency(plan.maxAmount) },
                  { label: 'ROI', value: `${plan.roiPercent}%` },
                  { label: 'Duration', value: `${plan.durationDays}d` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-bold text-slate-200 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editPlan ? 'Edit Plan' : 'Create Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Plan Name', placeholder: 'e.g. Starter', type: 'text' },
            { key: 'minAmount', label: 'Min Amount ($)', placeholder: '100', type: 'number' },
            { key: 'maxAmount', label: 'Max Amount ($)', placeholder: '10000', type: 'number' },
            { key: 'roiPercent', label: 'ROI (%)', placeholder: '5', type: 'number' },
            { key: 'durationDays', label: 'Duration (days)', placeholder: '30', type: 'number' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} className="input-field" placeholder={placeholder}
                value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
            <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : editPlan ? 'Update Plan' : 'Create Plan'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Plan" message="This will permanently delete this investment plan." />
    </div>
  );
}
