import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBanking } from '../context/BankingContext';
import { formatINR, INDIAN_BANKING_CONSTANTS } from '../utils/india';
import { 
  ShieldCheck, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Building2, 
  Sparkles,
  ChevronDown,
  RefreshCw,
  QrCode,
  Clock
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { totalNetWorth, refreshBankingData, isLoading } = useBanking();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTimeIST, setCurrentTimeIST] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeIST(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/95 border-b border-slate-800 backdrop-blur-md">
      
      {/* Top Regulatory Compliance Sub-bar */}
      <div className="bg-navy-900 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gold-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Regulated by Reserve Bank of India (RBI)
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-300">
            Deposits Insured by DICGC up to ₹5,00,000
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <span className="hidden sm:inline">IFSC: <strong className="text-slate-200">{INDIAN_BANKING_CONSTANTS.IFSC_CODE}</strong></span>
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-gold-500" />
            {currentTimeIST}
          </span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer py-2" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-navy-800 to-navy-900 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center border border-gold-500/30">
              <Building2 className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                CAPITAL CORE
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase rounded bg-gold-500/15 text-gold-400 border border-gold-500/30">
                INDIA
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 block tracking-wide">
              Private Banking & Wealth
            </span>
          </div>
        </div>

        {/* Center Live Net Worth in INR */}
        {user && user.role !== 'admin' && (
          <div className="hidden md:flex items-center gap-4 bg-navy-900 border border-slate-800 rounded-xl px-4 py-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Portfolio Liquidity
              </span>
              <span className="text-base font-extrabold text-white tracking-tight">
                {formatINR(totalNetWorth)}
              </span>
            </div>
            <button 
              onClick={() => refreshBankingData()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
              title="Sync Balance with CBS Core"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold-400' : ''}`} />
            </button>
          </div>
        )}

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          
          {/* UPI Quick Access button */}
          {user && user.role !== 'admin' && (
            <button
              onClick={() => setActiveTab('transfers')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:border-gold-500/60 hover:text-gold-400 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-gold-400" />
              <span>UPI Pay</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 hover:text-gold-400 hover:border-slate-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bank-card p-4 shadow-2xl z-50 border border-slate-800">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-white">Alerts & Bank Advisories</span>
                  <span className="text-[10px] text-gold-400 font-medium cursor-pointer">Clear</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800/80 text-xs">
                    <p className="font-semibold text-white">Salary Credit (NEFT)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">+₹1,85,000.00 credited via TCS Executive Payroll.</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">Today, 10:15 AM IST</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800/80 text-xs">
                    <p className="font-semibold text-emerald-400">Fixed Deposit Maturity Intimation</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">₹14,00,000 Privilege FD earning 7.50% p.a. interest.</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">Yesterday, 04:30 PM IST</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 pl-2.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-white block">{user.fullName}</span>
                  <span className="text-[10px] font-semibold tracking-wider text-gold-400 uppercase">
                    {user.role === 'admin' ? 'RBI Officer' : 'Privilege Client'}
                  </span>
                </div>
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bank-card p-2 shadow-2xl z-50 border border-slate-800">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        KYC Verified
                      </span>
                      {user.panNumber && (
                        <span className="text-[9px] font-mono text-slate-400">
                          PAN: {user.panNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('admin'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gold-400 hover:bg-navy-800 rounded-xl flex items-center gap-2 mb-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> RBI Compliance Desk
                    </button>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Secure Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('landing')}
              className="px-4 py-2 text-xs font-bold text-navy-950 bg-gold-400 hover:bg-gold-300 rounded-xl transition-all shadow-sm"
            >
              NetBanking Login
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
