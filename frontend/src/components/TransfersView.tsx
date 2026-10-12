import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { api } from '../services/api';
import { formatINR, isValidUPI, isValidIFSC, INDIAN_BANKING_CONSTANTS } from '../utils/india';
import { 
  Send, 
  ArrowLeftRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Lock,
  Zap,
  QrCode,
  Smartphone
} from 'lucide-react';

export const TransfersView: React.FC = () => {
  const { accounts, refreshBankingData } = useBanking();
  
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'INTERNAL'>('UPI');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [targetIfsc, setTargetIfsc] = useState('HDFC0000060');
  const [vpa, setVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; utr?: string } | null>(null);

  const selectedSourceAccount = accounts.find(a => a.id === fromAccountId) || accounts[0];

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid transfer amount in ₹ (INR)' });
      return;
    }
    if (selectedSourceAccount && numAmount > selectedSourceAccount.balance) {
      setFeedback({ type: 'error', message: `Insufficient funds. Available balance in ${selectedSourceAccount.accountName} is ${formatINR(selectedSourceAccount.balance)}` });
      return;
    }
    if (paymentMode === 'UPI') {
      if (!vpa || !isValidUPI(vpa)) {
        setFeedback({ type: 'error', message: 'Please enter a valid UPI Virtual Payment Address (e.g. name@okhdfcbank or merchant@paytm)' });
        return;
      }
    }
    if ((paymentMode === 'IMPS' || paymentMode === 'NEFT' || paymentMode === 'RTGS')) {
      if (!toAccountNumber || toAccountNumber.length < 9) {
        setFeedback({ type: 'error', message: 'Please enter a valid beneficiary Bank Account Number' });
        return;
      }
      if (!targetIfsc || !isValidIFSC(targetIfsc)) {
        setFeedback({ type: 'error', message: 'Please enter a valid 11-digit IFSC code (e.g. HDFC0000060 or SBIN0001049)' });
        return;
      }
      if (paymentMode === 'RTGS' && numAmount < 200000) {
        setFeedback({ type: 'error', message: 'As per RBI guidelines, minimum transfer amount for RTGS is ₹2,00,000. Please select IMPS or NEFT for lower amounts.' });
        return;
      }
    }

    setFeedback(null);
    setShowPinModal(true);
  };

  const handleConfirmTransfer = async () => {
    if (!pin || pin.length < 4) {
      setFeedback({ type: 'error', message: 'Enter your 4-digit NetBanking Security PIN' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.createTransfer({
        fromAccountId: selectedSourceAccount.id,
        toAccountNumber: paymentMode === 'INTERNAL' || paymentMode === 'IMPS' || paymentMode === 'NEFT' || paymentMode === 'RTGS' ? toAccountNumber : undefined,
        recipientName: recipientName || vpa,
        amount: Number(amount),
        description,
        category: paymentMode === 'UPI' ? 'UPI Instant Pay' : `${paymentMode} Transfer`,
        paymentMode,
        vpa: paymentMode === 'UPI' ? vpa : undefined,
        ifscCode: targetIfsc,
        pin
      });

      setFeedback({ 
        type: 'success', 
        message: res.message, 
        utr: res.transaction?.utrNumber || res.transaction?.referenceNumber 
      });
      setShowPinModal(false);
      setAmount('');
      setDescription('');
      setToAccountNumber('');
      setRecipientName('');
      setVpa('');
      setPin('');
      await refreshBankingData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Transfer failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30 uppercase">
              NPCI & RBI Compliant
            </span>
            <span className="text-xs text-slate-400">Zero charges on UPI & NEFT</span>
          </div>
          <h2 className="text-xl font-bold text-white">Unified Indian Payments Hub</h2>
          <p className="text-xs text-slate-400">Execute instantaneous 24x7 UPI, IMPS, NEFT, and RTGS fund settlements.</p>
        </div>
        <button
          onClick={() => setShowQrModal(true)}
          className="px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-gold-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
        >
          <QrCode className="w-4 h-4 text-gold-400" />
          <span>My UPI QR Code</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p>{feedback.message}</p>
            {feedback.utr && (
              <p className="font-mono text-[11px] text-slate-300 mt-0.5">
                Bank UTR: <strong>{feedback.utr}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Rail Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setPaymentMode('UPI')}
          className={`p-3 rounded-xl text-left border transition-all ${
            paymentMode === 'UPI'
              ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold shadow-sm'
              : 'bank-card border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-1 text-gold-400" />
          <p className="font-bold text-xs text-white">UPI Pay</p>
          <p className="text-[10px] text-slate-400">VPA / Handle (Instant)</p>
        </button>

        <button
          onClick={() => setPaymentMode('IMPS')}
          className={`p-3 rounded-xl text-left border transition-all ${
            paymentMode === 'IMPS'
              ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold shadow-sm'
              : 'bank-card border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 mb-1 text-blue-400" />
          <p className="font-bold text-xs text-white">IMPS 24x7</p>
          <p className="text-[10px] text-slate-400">Instant Acc + IFSC</p>
        </button>

        <button
          onClick={() => setPaymentMode('NEFT')}
          className={`p-3 rounded-xl text-left border transition-all ${
            paymentMode === 'NEFT'
              ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold shadow-sm'
              : 'bank-card border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 mb-1 text-emerald-400" />
          <p className="font-bold text-xs text-white">NEFT</p>
          <p className="text-[10px] text-slate-400">Zero Fee Settlement</p>
        </button>

        <button
          onClick={() => setPaymentMode('RTGS')}
          className={`p-3 rounded-xl text-left border transition-all ${
            paymentMode === 'RTGS'
              ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold shadow-sm'
              : 'bank-card border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-1 text-amber-400" />
          <p className="font-bold text-xs text-white">RTGS</p>
          <p className="text-[10px] text-slate-400">High-Value (&gt; ₹2 Lakhs)</p>
        </button>

        <button
          onClick={() => setPaymentMode('INTERNAL')}
          className={`p-3 rounded-xl text-left border transition-all ${
            paymentMode === 'INTERNAL'
              ? 'bg-navy-900 border-gold-500 text-gold-400 font-bold shadow-sm'
              : 'bank-card border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 mb-1 text-purple-400" />
          <p className="font-bold text-xs text-white">FD Sweep</p>
          <p className="text-[10px] text-slate-400">Internal Accounts</p>
        </button>
      </div>

      {/* Main Transfer Form */}
      <form onSubmit={handleInitiate} className="bank-card p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-5">
        
        {/* Source Account Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Debit From Account</label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} — {formatINR(acc.balance)} (Acc #{acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>
        </div>

        {/* UPI Details */}
        {paymentMode === 'UPI' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Beneficiary UPI ID (VPA)</label>
              <input
                type="text"
                required
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                placeholder="e.g. aditya@okhdfcbank or merchant@paytm"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Supports Google Pay, PhonePe, Paytm, BHIM handles</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Beneficiary Name (Optional)</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* IMPS / NEFT / RTGS Details */}
        {(paymentMode === 'IMPS' || paymentMode === 'NEFT' || paymentMode === 'RTGS') && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Beneficiary Legal Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Bandra Realty Infrastructure Pvt Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Beneficiary Account Number</label>
                <input
                  type="text"
                  required
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  placeholder="50100294819201"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Beneficiary Bank IFSC Code</label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  value={targetIfsc}
                  onChange={(e) => setTargetIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0000060"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase"
                />
              </div>
              <div className="flex items-center text-xs text-slate-400 pt-6">
                <span>{paymentMode === 'RTGS' ? 'Minimum amount: ₹2,00,000' : 'Settlement: 24x7 Real-Time'}</span>
              </div>
            </div>
          </>
        )}

        {/* Internal Sweep */}
        {paymentMode === 'INTERNAL' && (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Destination Vault / Account</label>
            <select
              value={toAccountNumber}
              onChange={(e) => setToAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold"
            >
              <option value="">Select target account...</option>
              {accounts.filter(a => a.id !== selectedSourceAccount?.id).map(acc => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountName} (Acc #{acc.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount & Remark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Amount to Transfer (₹ INR)</label>
            <input
              type="number"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full px-3.5 py-2.5 rounded-xl text-white text-lg font-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Remarks / Transaction Memo</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Office maintenance or Project fee"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Authorize {paymentMode} Payment</span>
        </button>

      </form>

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bank-card p-6 sm:p-7 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Authorize {paymentMode} Transfer</h3>
              <p className="text-xs text-slate-300">
                Debiting <span className="font-bold text-gold-400">{formatINR(Number(amount))}</span> from {selectedSourceAccount?.accountName}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 text-center mb-2">
                Enter 4-Digit Security PIN (Default: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl text-center font-mono text-2xl tracking-widest text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="py-2.5 rounded-xl font-semibold text-xs text-slate-400 bg-navy-900 border border-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmTransfer}
                disabled={isLoading}
                className="py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 shadow-sm flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Processing...' : 'Confirm & Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bank-card p-6 rounded-2xl border border-slate-700 max-w-sm w-full space-y-4 text-center">
            <h3 className="text-base font-bold text-white">Your Capital Core UPI QR</h3>
            <p className="text-xs text-slate-400">Scan to receive instant UPI payments from any Indian banking app.</p>
            
            <div className="p-4 bg-white rounded-xl inline-block mx-auto border-2 border-gold-500">
              <div className="w-48 h-48 bg-slate-900 rounded flex flex-col items-center justify-center text-gold-400 p-2">
                <QrCode className="w-32 h-32 text-white" />
                <span className="text-[10px] text-slate-300 mt-2 font-mono">aditya@capitalcore</span>
              </div>
            </div>

            <p className="font-mono text-xs text-gold-400 font-bold">UPI ID: aditya@capitalcore</p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-navy-900 border border-slate-800"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
