import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { api } from '../services/api';
import { formatINR, formatDateIST } from '../utils/india';
import { 
  ReceiptText, 
  CheckCircle2, 
  Clock, 
  Zap, 
  CreditCard,
  Building2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export const BillsView: React.FC = () => {
  const { bills, accounts, refreshBankingData } = useBanking();
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [isPaying, setIsPaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedBill = bills.find(b => b.id === selectedBillId);

  const handlePayBill = async () => {
    if (!selectedBillId || !selectedAccountId) return;
    setIsPaying(true);
    setFeedback(null);
    try {
      const res = await api.payBill(selectedBillId, selectedAccountId);
      setFeedback(res.message);
      setSelectedBillId(null);
      await refreshBankingData();
    } catch (err: any) {
      setFeedback(err.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
              Bharat BillPay (BBPS) Certified
            </span>
            <span className="text-xs text-slate-400">NPCI Integrated Network</span>
          </div>
          <h2 className="text-xl font-bold text-white">Utility Bill Pay & Subscriptions</h2>
          <p className="text-xs text-slate-400">Pay electricity, broadband, mobile, piped gas, and recharge national FASTag with instant receipt.</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-navy-900 border border-gold-500/30 flex items-center justify-center">
          <ReceiptText className="w-5 h-5 text-gold-400" />
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-3.5">
        {bills.map(bill => (
          <div key={bill.id} className="bank-card p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{bill.serviceProvider}</h3>
                  {bill.bbpsRef && (
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-navy-900 px-1.5 py-0.2 rounded border border-slate-800">
                      BBPS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{bill.category} • Ref #{bill.accountReference}</p>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Due Date: {formatDateIST(bill.dueDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <span className="text-lg font-black text-white">{formatINR(bill.amount)}</span>
                <span className={`block text-[10px] font-bold uppercase ${
                  bill.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {bill.status}
                </span>
              </div>

              {bill.status !== 'paid' ? (
                <button
                  onClick={() => setSelectedBillId(bill.id)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm"
                >
                  Pay via NetBanking
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Bill Paid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pay Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bank-card p-6 sm:p-7 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Authorize Bharat BillPay Settlement</h3>
            <p className="text-xs text-slate-300">
              Paying <span className="font-bold text-gold-400">{formatINR(selectedBill.amount)}</span> to {selectedBill.serviceProvider}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Select Debit Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} ({formatINR(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSelectedBillId(null)}
                className="py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-navy-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePayBill}
                disabled={isPaying}
                className="py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 shadow-sm"
              >
                {isPaying ? 'Authorizing BBPS...' : 'Confirm Bill Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
