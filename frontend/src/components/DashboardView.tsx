import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatINR, formatDateIST, INDIAN_BANKING_CONSTANTS } from '../utils/india';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Send, 
  ShieldCheck, 
  TrendingUp,
  Search,
  QrCode,
  PiggyBank,
  ReceiptText,
  Building2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTransfers: () => void;
  onNavigateToCards: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTransfers, onNavigateToCards }) => {
  const { accounts, transactions, activeAccount, setActiveAccount, cards } = useBanking();
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 6-Month Balance History Chart Data
  const baseBal = activeAccount?.balance || 248500;
  const historyData = [
    { month: 'May', balance: Math.round(baseBal * 0.72) },
    { month: 'Jun', balance: Math.round(baseBal * 0.79) },
    { month: 'Jul', balance: Math.round(baseBal * 0.84) },
    { month: 'Aug', balance: Math.round(baseBal * 0.91) },
    { month: 'Sep', balance: Math.round(baseBal * 0.96) },
    { month: 'Oct (Current)', balance: Math.round(baseBal) },
  ];

  const categoryData = [
    { name: 'Salary & Inflow', value: 185000, color: '#10B981' },
    { name: 'Rent & Housing', value: 65000, color: '#C5A059' },
    { name: 'Fixed Deposit Sweep', value: 50000, color: '#3B82F6' },
    { name: 'Dining, Travel & Bills', value: 24280, color: '#F43F5E' },
  ];

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.utrNumber && t.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Mobile-First Quick Actions Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onNavigateToTransfers}
          className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-gold-500/50 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">UPI Pay</span>
            <span className="text-[10px] text-slate-400">Scan & Transfer</span>
          </div>
        </button>

        <button
          onClick={onNavigateToTransfers}
          className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-gold-500/50 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">IMPS / NEFT</span>
            <span className="text-[10px] text-slate-400">Bank Transfer</span>
          </div>
        </button>

        <button
          onClick={onNavigateToCards}
          className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-gold-500/50 flex items-center gap-3 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">RuPay Cards</span>
            <span className="text-[10px] text-slate-400">{cards.length} Active Cards</span>
          </div>
        </button>

        <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">FD Vaults</span>
            <span className="text-[10px] text-gold-400 font-semibold">7.75% p.a.</span>
          </div>
        </div>
      </div>

      {/* Account Selector & Card Carousel Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Account Details Card */}
        <div className="lg:col-span-8 bank-card p-6 rounded-2xl border border-slate-800 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accounts:</span>
              <div className="flex gap-2 flex-wrap">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setActiveAccount(acc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeAccount?.id === acc.id
                        ? 'bg-navy-900 text-gold-400 border border-gold-500/40 font-bold'
                        : 'bg-navy-950 text-slate-400 hover:bg-navy-900 border border-slate-800'
                    }`}
                  >
                    {acc.accountName.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeAccount && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Available Balance ({activeAccount.currency})
                  </span>
                  {activeAccount.interestRate && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      {activeAccount.interestRate}% p.a.
                    </span>
                  )}
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                  {formatINR(activeAccount.balance)}
                </p>

                {/* Indian Banking Codes (IFSC, MICR, Account #) */}
                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <span className="text-slate-400">Account #:</span>
                    <span className="font-bold">
                      {showFullAccount ? activeAccount.accountNumber : `•••• •••• ${activeAccount.accountNumber.slice(-4)}`}
                    </span>
                    <button 
                      onClick={() => setShowFullAccount(!showFullAccount)}
                      className="text-slate-400 hover:text-gold-400"
                    >
                      {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(activeAccount.accountNumber, 'acc')}
                      className="text-slate-400 hover:text-gold-400"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">IFSC:</span>
                      <strong className="text-white">{INDIAN_BANKING_CONSTANTS.IFSC_CODE}</strong>
                      <button 
                        onClick={() => copyToClipboard(INDIAN_BANKING_CONSTANTS.IFSC_CODE, 'ifsc')}
                        className="text-slate-400 hover:text-gold-400"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">MICR:</span>
                      <strong className="text-white">{INDIAN_BANKING_CONSTANTS.MICR_CODE}</strong>
                    </div>
                  </div>

                  {activeAccount.upiId && (
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <span className="text-slate-400">UPI ID:</span>
                      <strong className="text-gold-400">{activeAccount.upiId}</strong>
                      <button 
                        onClick={() => copyToClipboard(activeAccount.upiId!, 'upi')}
                        className="text-slate-400 hover:text-gold-400"
                      >
                        {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col justify-end space-y-2.5">
                <button
                  onClick={onNavigateToTransfers}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Money (UPI / IMPS / NEFT)</span>
                </button>

                <button
                  onClick={onNavigateToCards}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-navy-900 hover:bg-navy-800 border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-gold-400" />
                  <span>Manage Metal Cards ({cards.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary RuPay Select Sovereign Card Preview Widget */}
        <div className="lg:col-span-4 card-rupay-select p-6 rounded-2xl relative flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400 block">
                CAPITAL CORE PRIVATE
              </span>
              <span className="text-xs font-bold text-slate-200">RUPAY SELECT METAL</span>
            </div>
            <div className="flex items-center gap-1.5 text-gold-400 text-xs font-bold">
              <span>RuPay</span>
            </div>
          </div>

          <div className="my-3">
            <span className="text-sm sm:text-base font-mono tracking-widest text-slate-100 block drop-shadow">
              {cards[0]?.cardNumber || '6521 •••• •••• 8812'}
            </span>
          </div>

          <div className="flex justify-between items-end text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Card Holder</span>
              <span className="font-bold text-white">{cards[0]?.cardHolder || 'ADITYA SHARMA'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Expires</span>
              <span className="font-bold text-white">{cards[0]?.expDate || '12/29'}</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 uppercase block">Tap & Pay</span>
              <span className="font-bold text-emerald-400">Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Financial Trajectory & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Balance Trend AreaChart */}
        <div className="lg:col-span-8 bank-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Monthly Liquidity Trend</h3>
              <p className="text-[11px] text-slate-400">Account balance progression across recent cycles</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% Net Inflow</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => formatINR(v, { compact: true, showSymbol: true })} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080F22', borderColor: '#1E293B', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Available Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#C5A059" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown PieChart */}
        <div className="lg:col-span-4 bank-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Monthly Cash Flow Allocation</h3>
            <p className="text-[11px] text-slate-400">Breakdown of inflow vs savings and expenses</p>
          </div>

          <div className="h-40 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080F22', borderColor: '#1E293B', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(v: any) => [formatINR(Number(v)), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300">{c.name}</span>
                </div>
                <span className="font-bold text-white">{formatINR(c.value, { compact: true })}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transaction History Ledger */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Audited Transaction Ledger</h3>
            <p className="text-xs text-slate-400">Real-time ledger with Indian UTR & payment rail references</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, UTR, UPI ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Transaction Details</th>
                <th className="py-2.5 px-3">Payment Rail</th>
                <th className="py-2.5 px-3">Reference / UTR #</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.map(tx => {
                const isIncoming = tx.type === 'deposit' || tx.category.toLowerCase().includes('salary') || tx.category.toLowerCase().includes('income');
                return (
                  <tr key={tx.id} className="hover:bg-navy-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncoming ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">{formatDateIST(tx.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.paymentMode === 'UPI' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                        tx.paymentMode === 'IMPS' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' :
                        tx.paymentMode === 'NEFT' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        tx.paymentMode === 'BBPS' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {tx.paymentMode || 'UPI'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {tx.utrNumber || tx.referenceNumber}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold text-xs ${
                      isIncoming ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {isIncoming ? '+' : '-'}{formatINR(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tx.status === 'flagged' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
