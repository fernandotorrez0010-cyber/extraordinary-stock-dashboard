// src/features/admin/AdminKYCPage.jsx
import { useState, useEffect } from 'react';
import { FileCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getAllKYC, updateKYC, getAllUsers } from '../../firebase/firestoreService';
import { formatDate } from '../../utils/helpers';
import { Badge, PageHeader, Modal, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminKYCPage() {
  const [kycList, setKycList] = useState([]);
  const [users, setUsers] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState('');

  const load = async () => {
    const [kyc, userList] = await Promise.all([getAllKYC(), getAllUsers()]);
    const userMap = {};
    userList.forEach(u => { userMap[u.id] = u; });
    setKycList(kyc);
    setUsers(userMap);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    setLoading(id + status);
    try {
      await updateKYC(id, { status });
      toast.success(`KYC ${status}`);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  };

  const pending = kycList.filter(k => k.status === 'pending');

  return (
    <div>
      <PageHeader title="KYC Verification" subtitle={`${pending.length} pending review`} />

      {kycList.length === 0 ? (
        <EmptyState icon={FileCheck} title="No KYC submissions" description="User KYC submissions will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Email', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kycList.map(kyc => {
                  const user = users[kyc.userId];
                  return (
                    <tr key={kyc.id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-slate-200">{user?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{user?.email || '—'}</td>
                      <td className="px-4 py-3.5"><Badge status={kyc.status} /></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(kyc.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setSelected(kyc)}
                            className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors" title="View documents">
                            <Eye size={14} />
                          </button>
                          {kyc.status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(kyc.id, 'approved')}
                                className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors" title="Approve">
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => handleAction(kyc.id, 'rejected')}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Reject">
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="KYC Documents" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge status={selected.status} />
              <span className="text-xs text-slate-500">{users[selected.userId]?.name} · {users[selected.userId]?.email}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Government ID', url: selected.idUrl },
                { label: 'Selfie with ID', url: selected.selfieUrl },
                { label: 'Proof of Address', url: selected.addressUrl },
              ].map(({ label, url }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={label}
                        className="w-full h-32 object-cover rounded-xl border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer" />
                    </a>
                  ) : (
                    <div className="w-full h-32 rounded-xl border border-slate-800 bg-slate-800/30 flex items-center justify-center text-slate-600 text-xs">
                      Not uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selected.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                  <CheckCircle size={17} /> Approve KYC
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-colors border border-red-500/30 disabled:opacity-50">
                  <XCircle size={17} /> Reject KYC
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
