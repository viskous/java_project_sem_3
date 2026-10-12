import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  PiggyBank, 
  Landmark, 
  ReceiptText, 
  ShieldAlert,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDIAN_BANKING_CONSTANTS } from '../utils/india';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Account Overview', icon: LayoutDashboard },
    { id: 'transfers', label: 'UPI & Fund Transfers', icon: QrCode },
    { id: 'cards', label: 'RuPay & Visa Metal Cards', icon: CreditCard },
    { id: 'vaults', label: 'Fixed Deposits (7.75%)', icon: PiggyBank },
    { id: 'loans', label: 'Loans & CIBIL Bureau', icon: Landmark },
    { id: 'bills', label: 'Bharat BillPay (BBPS)', icon: ReceiptText },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'RBI Compliance Portal',
      icon: ShieldAlert,
    });
  }

  return (
    <aside className="hidden md:block md:w-64 bank-card rounded-2xl p-4 space-y-2 shrink-0 border border-slate-800 self-start">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
        Banking & Wealth Services
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isActive
                ? 'bg-navy-900 border border-gold-500/40 text-gold-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-navy-900/60 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* RBI & DICGC Insurance Trust Card */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
        <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-gold-400 font-bold text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DICGC Depositor Guarantee</span>
          </div>
          <p className="text-xs text-slate-300 font-semibold">
            Insured up to ₹5 Lakhs
          </p>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            All principal and interest amounts backed under the DICGC Act, 1961.
          </p>
        </div>

        <div className="px-2 text-[10px] text-slate-500 font-mono space-y-0.5">
          <p>IFSC: {INDIAN_BANKING_CONSTANTS.IFSC_CODE}</p>
          <p>MICR: {INDIAN_BANKING_CONSTANTS.MICR_CODE}</p>
          <p>Branch: Nariman Point, Mumbai</p>
        </div>
      </div>
    </aside>
  );
};
