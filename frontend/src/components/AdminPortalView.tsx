import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminStats, User, AuditLog, Loan } from '../types';
import { formatINR, formatDateIST } from '../utils/india';
import { 
  ShieldAlert, 
  Users, 
  Landmark, 
  FileText, 
  Check, 
  X, 
  Snowflake, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AdminPortalView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [s, u, l, a] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getLoans(),
        api.getAuditLogs()
      ]);
      setStats(s);
      setUsers(u);
      setLoans(l);
      setAuditLogs(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLoanAction = async (loanId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateLoanStatus(loanId, status);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFreezeUser = async (userId: string, isCurrentlyFrozen: boolean) => {
    try {
      await api.freezeUserAccount(userId, !isCurrentlyFrozen);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bank-card p-6 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>RBI Statutory Compliance & Regulatory Oversight Desk</span>
          </div>
          <h2 className="text-xl font-bold text-white">Executive Director & Compliance Portal</h2>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 hover:text-gold-400 transition-colors"
          title="Refresh RBI Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-gold-400' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bank-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bank Liquidity</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatINR(stats.totalBankLiquidity, { compact: true })}</p>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{formatINR(stats.totalBankLiquidity)}</span>
          </div>
          <div className="bank-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active KYC Customers</span>
            <p className="text-2xl font-black text-white mt-1">{stats.activeCustomers}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">100% Aadhaar Verified</span>
          </div>
          <div className="bank-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLR + CRR Ratio</span>
            <p className="text-2xl font-black text-gold-400 mt-1">{stats.reserveRatioPct}%</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Meets RBI Capital Adequacy</span>
          </div>
          <div className="bank-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High-Value Flagged Txs</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{stats.flaggedTransactions}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">&gt; ₹10 Lakhs Threshold</span>
          </div>
        </div>
      )}

      {/* Institutional Loan Underwriting Queue */}
      <div className="bank-card p-5 rounded-2xl border border-slate-800 space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Underwriting & Credit Committee Queue</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Applicant Name</th>
                <th className="py-2.5 px-3">Scheme & Purpose</th>
                <th className="py-2.5 px-3">Principal (₹)</th>
                <th className="py-2.5 px-3">CIBIL Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Underwriting Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loans.map(loan => (
                <tr key={loan.id} className="hover:bg-navy-900/40">
                  <td className="py-3 px-3 font-bold text-white">{loan.applicantName}</td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="text-[10px] font-bold text-gold-400 block">{loan.loanScheme || 'Personal Loan'}</span>
                    {loan.purpose}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">{formatINR(loan.amount)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{loan.cibilScore} / 900</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      loan.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      loan.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {loan.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleLoanAction(loan.id, 'approved')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          title="Sanction Loan"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLoanAction(loan.id, 'rejected')}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                          title="Reject Application"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Accounts & KYC Status */}
      <div className="bank-card p-5 rounded-2xl border border-slate-800 space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Client KYC & Compliance Registry</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">PAN & Mobile</th>
                <th className="py-2.5 px-3">UPI ID</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">KYC Status</th>
                <th className="py-2.5 px-3 text-center">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-navy-900/40">
                  <td className="py-3 px-3 font-bold text-white">
                    {u.fullName}
                    <span className="block text-[10px] text-slate-400 font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                    <span className="font-bold text-gold-400 block">{u.panNumber || 'PAN REGISTERED'}</span>
                    <span>{u.phone}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">{u.upiId || 'Not created'}</td>
                  <td className="py-3 px-3 text-slate-300 text-xs">
                    {u.city ? `${u.city}, ${u.state}` : 'Mumbai, MH'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleFreezeUser(u.id, u.status === 'frozen')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        u.status === 'frozen'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {u.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bank-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Indian Banking Audit Trail (IST Timestamped)</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {auditLogs.map(log => (
            <div key={log.id} className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-white">{log.userName}</span>
                <span className="text-gold-400 ml-2">[{log.action}]</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <span>{log.ipAddress}</span>
                <span className="block">{formatDateIST(log.timestamp, true)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
