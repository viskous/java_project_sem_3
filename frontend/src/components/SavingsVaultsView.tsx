import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { api } from '../services/api';
import { formatINR, INDIAN_BANKING_CONSTANTS } from '../utils/india';
import { 
  PiggyBank, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Award,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const SavingsVaultsView: React.FC = () => {
  const { accounts, refreshBankingData } = useBanking();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vaultName, setVaultName] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('100000');
  const [vaultType, setVaultType] = useState<'fixed_deposit' | 'recurring_deposit' | 'savings'>('fixed_deposit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRoundUp, setAutoRoundUp] = useState(true);

  const fdAndSavings = accounts.filter(a => a.accountType === 'fixed_deposit' || a.accountType === 'savings' || a.accountType === 'investment');
  const totalSavings = fdAndSavings.reduce((sum, a) => sum + a.balance, 0);

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultName) return;
    setIsSubmitting(true);
    try {
      await api.createVault(vaultName, vaultType, Number(initialDeposit));
      setShowCreateModal(false);
      setVaultName('');
      setInitialDeposit('100000');
      await refreshBankingData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Vault Header Card */}
      <div className="bank-card-gold p-6 sm:p-7 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-6 relative">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Privilege Yield Engine • Up to 7.75% p.a.</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Fixed Deposit & Wealth Holdings</h2>
          <p className="text-2xl sm:text-3xl font-black text-gold-400">
            {formatINR(totalSavings)}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Open Fixed / Recurring Deposit</span>
        </button>
      </div>

      {/* Tax Saving & Auto Round-up Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Auto Round-up Rule Engine */}
        <div className="bank-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Smart Debit Round-Up Sweeps</h4>
              <p className="text-[11px] text-slate-400">Rounds up UPI / Card payments to nearest ₹50 into FD Vault.</p>
            </div>
          </div>

          <button
            onClick={() => setAutoRoundUp(!autoRoundUp)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
              autoRoundUp ? 'bg-gold-500' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-navy-950 transition-transform ${
              autoRoundUp ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Section 80C Tax-Saver Badge */}
        <div className="bank-card p-5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Section 80C Tax Deduction</h4>
            <p className="text-[11px] text-slate-400">Save up to ₹1,50,000 on taxable income under 5-Year Tax Saver FDs.</p>
          </div>
        </div>

      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fdAndSavings.map((vault, idx) => {
          const goalTarget = (idx + 1) * 2000000; // e.g. ₹20 Lakhs, ₹40 Lakhs
          const pct = Math.min(100, Math.round((vault.balance / goalTarget) * 100));
          const isFD = vault.accountType === 'fixed_deposit';
          return (
            <div key={vault.id} className="bank-card p-5 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{vault.accountName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Acc #{vault.accountNumber} • {vault.ifscCode}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {vault.interestRate || (isFD ? 7.5 : 4.5)}% p.a.
                </span>
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {formatINR(vault.balance)}
                </span>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                  <span>Goal Accumulation</span>
                  <span>{pct}% of {formatINR(goalTarget, { compact: true })}</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden border border-slate-800 mt-1">
                  <div 
                    className="bg-gold-500 h-full rounded-full transition-all" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bank-card p-6 sm:p-7 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Open Fixed or Recurring Deposit</h3>

            <form onSubmit={handleCreateVault} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deposit Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVaultType('fixed_deposit')}
                    className={`p-2 rounded-xl text-center text-xs font-bold border ${
                      vaultType === 'fixed_deposit' ? 'bg-navy-900 border-gold-500 text-gold-400' : 'bg-navy-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fixed Deposit (7.50% p.a.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultType('recurring_deposit')}
                    className={`p-2 rounded-xl text-center text-xs font-bold border ${
                      vaultType === 'recurring_deposit' ? 'bg-navy-900 border-gold-500 text-gold-400' : 'bg-navy-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Recurring Deposit (RD)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deposit Purpose / Title</label>
                <input
                  type="text"
                  required
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  placeholder="e.g. South Mumbai Flat Downpayment"
                  className="w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Principal Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-navy-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 shadow-sm"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
