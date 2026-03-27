// src/features/admin/AdminInvestmentsPage.jsx
import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { getAllInvestments, updateInvestment, getAllUsers } from '../../firebase/firestoreService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Badge, PageHeader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState('');

  const load = async () => {
    const [invs, userList] = await Promise.all([getAllInvestments(), getAllUsers()]);
    setInvestments(invs);
    const map = {};
    userList.forEach(u => { map[u.id] = u; });
    setUsers(map);
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (inv) => {
    setLoading(inv.id);
    try {
      await updateInvestment(inv.id, { status: 'completed' });
      toast.success('Investment marked as completed');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  };

  const active = investments.filter(i => i.status === 'active');
  const completed = investments.filter(i => i.status === 'completed');

  return (
    <div>
      <PageHeader title="Investments" subtitle={`${active.length} active · ${investments.length} total`} />

      {investments.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No investments yet" description="User investments will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Plan', 'Amount', 'ROI %', 'Profit', 'Status', 'Start', 'End', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => {
                  const user = users[inv.userId];
                  return (
                    <tr key={inv.id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-slate-200 text-xs">{user?.name || 'Unknown'}</p>
                          <p className="text-slate-500 text-[10px]">{user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-200">{inv.planName}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-200 font-mono">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3.5 text-green-400 font-semibold">{inv.roiPercent}%</td>
                      <td className="px-4 py-3.5 font-bold text-green-400 font-mono">{formatCurrency(inv.profit)}</td>
                      <td className="px-4 py-3.5"><Badge status={inv.status} /></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(inv.startDate)}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(inv.endDate)}</td>
                      <td className="px-4 py-3.5">
                        {inv.status === 'active' && (
                          <button
                            onClick={() => handleComplete(inv)}
                            disabled={loading === inv.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors disabled:opacity-50 whitespace-nowrap">
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
