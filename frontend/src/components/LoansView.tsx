import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { api } from '../services/api';
import { formatINR, formatDateIST } from '../utils/india';
import { 
  Landmark, 
  CheckCircle2, 
  Clock, 
  Calculator, 
  Sparkles, 
  ShieldCheck,
  Percent,
  Award
} from 'lucide-react';

export const LoansView: React.FC = () => {
  const { loans, refreshBankingData } = useBanking();

  // Interactive Loan Calculator state
  const [loanAmount, setLoanAmount] = useState(2500000); // ₹25 Lakhs
  const [termMonths, setTermMonths] = useState(120); // 10 years
  const [loanScheme, setLoanScheme] = useState('Home Loan');
  const [purpose, setPurpose] = useState('Apartment Purchase, Powai Mumbai');
  const [annualIncome, setAnnualIncome] = useState(2400000); // ₹24 Lakhs
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // CIBIL Score (TransUnion Bureau Rating)
  const simulatedCibilScore = 785;
  
  // Rate linked to loan scheme & RBI repo rate
  const getSchemeRate = (scheme: string) => {
    if (scheme === 'Home Loan') return 8.40;
    if (scheme === 'Business MSME') return 9.25;
    return 10.50; // Personal Privilege
  };

  const interestRate = getSchemeRate(loanScheme);
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = Number(((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)).toFixed(2));
  const totalRepayment = monthlyPayment * termMonths;
  const totalInterest = totalRepayment - loanAmount;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setFeedback(null);
    try {
      const res = await api.applyForLoan({
        amount: loanAmount,
        termMonths,
        purpose,
        loanScheme,
        annualIncome
      });
      setFeedback(res.message);
      await refreshBankingData();
    } catch (err: any) {
      setFeedback(err.message || 'Loan application submission failed');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              RBI Repo-Linked Lending Rate (RLLR)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Loans & Credit Underwriting</h2>
          <p className="text-xs text-slate-400">Low-rate Home, MSME, and Personal Loans with paperless digital sanctioning.</p>
        </div>
        
        {/* CIBIL Bureau Badge */}
        <div className="flex items-center gap-3 bg-navy-900 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">TransUnion CIBIL</span>
            <span className="text-base font-black text-emerald-400">{simulatedCibilScore} / 900</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            Excellent
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-gold-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Interactive EMI Calculator & Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Loan Controls */}
        <form onSubmit={handleApply} className="lg:col-span-7 bank-card p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gold-400" />
            <span>EMI Amortization Configurator</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select Loan Scheme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Home Loan', rate: '8.40% p.a.' },
                { name: 'Business MSME', rate: '9.25% p.a.' },
                { name: 'Personal Loan', rate: '10.50% p.a.' },
              ].map(scheme => (
                <button
                  key={scheme.name}
                  type="button"
                  onClick={() => setLoanScheme(scheme.name)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    loanScheme === scheme.name 
                      ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold' 
                      : 'bg-navy-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="text-xs">{scheme.name}</p>
                  <p className="text-[10px] text-slate-400">{scheme.rate}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">Requested Principal:</span>
              <span className="text-gold-400 font-bold">{formatINR(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="20000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-gold-500 bg-navy-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>₹1 Lakh</span>
              <span>₹1 Crore</span>
              <span>₹2 Crore</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">Repayment Tenure:</span>
              <span className="text-gold-400 font-bold">{termMonths} Months ({termMonths / 12} Years)</span>
            </div>
            <input
              type="range"
              min="12"
              max="240"
              step="12"
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-gold-500 bg-navy-900 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Asset Purpose / Property Details</label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isApplying}
            className="w-full py-3 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm"
          >
            {isApplying ? 'Checking Underwriting Limits...' : 'Apply for Pre-Sanctioned Loan'}
          </button>
        </form>

        {/* Calculation Quote Summary Box */}
        <div className="lg:col-span-5 bank-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated EMI Schedule</span>
            
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Equated Monthly Installment (EMI)</span>
              <p className="text-3xl font-black text-white">
                {formatINR(monthlyPayment)}
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">per month</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>Effective Floating Rate:</span>
                <span className="font-bold text-emerald-400">{interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>Total Interest Payable:</span>
                <span className="font-bold text-slate-200">{formatINR(totalInterest, { compact: true })}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>Total Repayment (P + I):</span>
                <span className="font-bold text-gold-400">{formatINR(totalRepayment, { compact: true })}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Disbursal Timeline:</span>
                <span className="font-bold text-white">Instant to Primary Savings Acc</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Active Loan Portfolio */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Sanctioned Loan Accounts</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Applicant</th>
                <th className="py-2.5 px-3">Scheme & Purpose</th>
                <th className="py-2.5 px-3">Principal (₹)</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3">Monthly EMI</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loans.map(loan => (
                <tr key={loan.id} className="hover:bg-navy-900/40">
                  <td className="py-3 px-3 font-bold text-white">{loan.applicantName}</td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="text-[10px] font-bold text-gold-400 block">{loan.loanScheme || 'Personal Loan'}</span>
                    {loan.purpose}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">{formatINR(loan.amount)}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{loan.interestRate}%</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{formatINR(loan.monthlyPayment)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      loan.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      loan.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
