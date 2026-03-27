// src/features/kyc/KYCPage.jsx
import { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitKYC, getKYC } from '../../firebase/firestoreService';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

function DocUpload({ label, hint, file, onChange, preview }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{label}</label>
      <p className="text-xs text-slate-500 mb-3">{hint}</p>
      <label className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        file ? 'border-green-500/40 bg-green-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
      }`}>
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onChange} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            {file.type?.startsWith('image') && preview ? (
              <img src={preview} alt="" className="h-20 w-full object-contain rounded" />
            ) : (
              <CheckCircle size={24} className="text-green-400" />
            )}
            <span className="text-xs text-green-400 font-medium truncate max-w-[150px]">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Upload size={22} />
            <span className="text-sm">Upload document</span>
            <span className="text-xs">JPG, PNG, PDF</span>
          </div>
        )}
      </label>
    </div>
  );
}

export default function KYCPage() {
  const { profile } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [files, setFiles] = useState({ idCard: null, selfie: null, address: null });
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) getKYC(profile.uid).then(setKyc);
  }, [profile?.uid]);

  const setFile = (key) => (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFiles(p => ({ ...p, [key]: f }));
    if (f.type.startsWith('image')) {
      const url = URL.createObjectURL(f);
      setPreviews(p => ({ ...p, [key]: url }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.idCard || !files.selfie || !files.address)
      return toast.error('Please upload all three documents');
    setLoading(true);
    try {
      await submitKYC(profile.uid, files);
      toast.success('KYC submitted! Awaiting review.');
      const updated = await getKYC(profile.uid);
      setKyc(updated);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatusBanner = () => {
    if (!kyc) return null;
    const cfg = {
      pending: { icon: Clock, color: 'yellow', msg: 'Your documents are under review. This usually takes 1–2 business days.' },
      approved: { icon: CheckCircle, color: 'green', msg: 'Your identity has been verified! Your account is fully activated.' },
      rejected: { icon: XCircle, color: 'red', msg: 'Your KYC was rejected. Please re-submit with correct documents.' },
    };
    const { icon: Icon, color, msg } = cfg[kyc.status] || cfg.pending;
    const colors = {
      yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
      green: 'bg-green-500/10 border-green-500/30 text-green-300',
      red: 'bg-red-500/10 border-red-500/30 text-red-300',
    };
    return (
      <div className={`card p-4 flex items-start gap-3 mb-6 ${colors[color]} border`}>
        <Icon size={18} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold capitalize">{kyc.status}</p>
          <p className="text-sm opacity-80 mt-0.5">{msg}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="KYC Verification" subtitle="Verify your identity to unlock full account features" />
      <StatusBanner />

      {kyc?.status === 'approved' ? (
        <div className="card p-8 text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Fully Verified</h2>
          <p className="text-slate-400">Your account has full access to all platform features.</p>
        </div>
      ) : (
        <div className="card p-6 max-w-2xl">
          <h2 className="font-semibold text-slate-200 mb-1">Upload Verification Documents</h2>
          <p className="text-sm text-slate-500 mb-6">All documents must be clear, valid, and readable.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DocUpload
                label="Government ID"
                hint="Passport, driver's license, or national ID"
                file={files.idCard}
                onChange={setFile('idCard')}
                preview={previews.idCard}
              />
              <DocUpload
                label="Selfie with ID"
                hint="Hold your ID next to your face"
                file={files.selfie}
                onChange={setFile('selfie')}
                preview={previews.selfie}
              />
              <DocUpload
                label="Proof of Address"
                hint="Utility bill or bank statement (3 months)"
                file={files.address}
                onChange={setFile('address')}
                preview={previews.address}
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <p className="font-semibold mb-1">Requirements:</p>
              <ul className="space-y-0.5 list-disc list-inside opacity-80">
                <li>Documents must be government-issued and valid</li>
                <li>All four corners must be visible</li>
                <li>File size: Max 5MB per document</li>
                <li>Accepted formats: JPG, PNG, PDF</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                : <><FileCheck size={17} /> {kyc ? 'Resubmit Documents' : 'Submit for Verification'}</>
              }
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
