import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  formatINR, 
  INDIAN_STATES_AND_UTS, 
  INDIAN_BANKING_CONSTANTS,
  isValidIndianMobile,
  isValidPAN,
  isValidIndianPINCode
} from '../utils/india';
import { 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  Lock, 
  CreditCard, 
  Zap, 
  Globe2, 
  Award,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LandingPage: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const { demoLogin, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [city, setCity] = useState('Mumbai');
  const [postalCode, setPostalCode] = useState('400050');
  const [pinCode, setPinCode] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Interactive Fixed Deposit (FD) Calculator State
  const [fdAmount, setFdAmount] = useState(500000); // ₹5 Lakhs
  const [fdYears, setFdYears] = useState(3);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  
  const fdRate = isSeniorCitizen ? 7.75 : 7.25;
  // Quarterly Compounding standard for Indian Banks: A = P * (1 + r/400)^(4*n)
  const maturityAmount = Math.round(fdAmount * Math.pow(1 + fdRate / 400, 4 * fdYears));
  const interestEarned = maturityAmount - fdAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      if (phone && !isValidIndianMobile(phone)) {
        setError('Please enter a valid 10-digit Indian mobile number (+91)');
        return;
      }
      if (panNumber && !isValidPAN(panNumber)) {
        setError('Please enter a valid 10-digit PAN number (e.g. ABCPS1234F)');
        return;
      }
      if (postalCode && !isValidIndianPINCode(postalCode)) {
        setError('Please enter a valid 6-digit Indian Postal PIN code');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await register({ 
          email, 
          password, 
          fullName, 
          phone: phone.startsWith('+91') ? phone : `+91 ${phone}`, 
          pinCode,
          panNumber: panNumber.toUpperCase(),
          city,
          state: selectedState,
          postalCode
        });
      } else {
        await login(email, password);
      }
      onExplore();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white selection:bg-gold-500 selection:text-navy-950 pb-20">
      
      {/* Top Regulatory Trust Strip */}
      <div className="bg-navy-900/90 border-b border-slate-800 px-4 py-2 text-center text-xs text-slate-300 flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-gold-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Scheduled Commercial Bank • Reserve Bank of India (RBI) Regulated
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-300">
          DICGC Depositor Insurance up to <strong>₹5,00,000</strong>
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 font-mono text-[11px]">
          IFSC: {INDIAN_BANKING_CONSTANTS.IFSC_CODE}
        </span>
      </div>

      {/* Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-gold-500/30 text-gold-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Sovereign Private Banking & Institutional Wealth</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Banking Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-white">
                India's Wealth Creators
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Experience private digital banking tailored for high-net-worth individuals, tech founders, and family enterprises in India. Featuring 7.75% p.a. Fixed Deposits, RuPay Select metal cards, zero-latency UPI, and instant pre-approved credit lines.
            </p>

            {/* Indian Trust Highlights Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 text-left">
                <p className="text-lg font-black text-gold-400">7.75%</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Privilege FD p.a.</p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 text-left">
                <p className="text-lg font-black text-emerald-400">₹0 Fee</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Instant UPI & NEFT</p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 text-left">
                <p className="text-lg font-black text-cyan-400">RuPay</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Select Metal Card</p>
              </div>
            </div>

            {/* Instant Demo Login Presets */}
            <div className="pt-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>⚡ Instant Demo Access (Click to Test Live):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={async () => { await demoLogin('consumer'); onExplore(); }}
                  className="p-3.5 rounded-xl bank-card hover:border-gold-500/60 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-gold-400 uppercase bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/20">
                      Resident
                    </span>
                  </div>
                  <p className="font-bold text-xs text-white mt-2">Aditya Sharma</p>
                  <p className="text-[11px] text-slate-400">₹2.48L Savings • ₹14L FD</p>
                </button>

                <button
                  onClick={async () => { await demoLogin('business'); onExplore(); }}
                  className="p-3.5 rounded-xl bank-card hover:border-gold-500/60 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Corporate
                    </span>
                  </div>
                  <p className="font-bold text-xs text-white mt-2">Apex Tech India</p>
                  <p className="text-[11px] text-slate-400">₹1.45 Cr Current Acc</p>
                </button>

                <button
                  onClick={async () => { await demoLogin('admin'); onExplore(); }}
                  className="p-3.5 rounded-xl bank-card hover:border-gold-500/60 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold text-purple-400 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      Executive
                    </span>
                  </div>
                  <p className="font-bold text-xs text-white mt-2">RBI Compliance</p>
                  <p className="text-[11px] text-slate-400">Regulatory Oversight</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Login / Indian Registration Form Card */}
          <div className="lg:col-span-5">
            <div className="bank-card-gold p-6 sm:p-7 rounded-2xl border border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isRegisterMode ? 'Open Savings & Wealth Account' : 'NetBanking Client Access'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRegisterMode ? 'Paperless KYC with PAN & Aadhaar' : 'Secure 256-bit encrypted authentication'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center border border-gold-500/30">
                  <Lock className="w-4 h-4 text-gold-400" />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isRegisterMode && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Legal Name (as per PAN Card)</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aditya Sharma"
                        className="w-full px-3.5 py-2 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile (+91)</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98201 44520"
                          className="w-full px-3.5 py-2 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">PAN Card Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          required
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          placeholder="ABCPS1234F"
                          className="w-full px-3.5 py-2 rounded-xl text-xs uppercase font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">State / UT</label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs"
                        >
                          {INDIAN_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Postal PIN Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="400050"
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Registered Email ID</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditya@capitalcore.com"
                    className="w-full px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>

                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Set 4-Digit NetBanking Security PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3.5 py-2 rounded-xl text-xs text-center font-mono tracking-widest"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm flex items-center justify-center gap-2 mt-3"
                >
                  <span>{isLoading ? 'Processing KYC...' : isRegisterMode ? 'Complete KYC & Open Account' : 'Sign In to NetBanking'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <button
                  onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                  className="text-xs font-semibold text-gold-400 hover:underline"
                >
                  {isRegisterMode ? 'Already registered? Sign in with NetBanking credentials' : 'New to Capital Core? Apply for a Savings & Wealth Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Fixed Deposit (FD) Yield Simulator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bank-card p-6 sm:p-8 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Safe Capital Growth</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Fixed Deposit (FD) Compounding Calculator</h3>
              <p className="text-xs text-slate-400 mt-1">
                Quarterly compounded interest with senior citizen privilege bonus under DICGC insurance protection.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-navy-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isSeniorCitizen}
                onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                className="rounded accent-gold-500"
              />
              <span>Senior Citizen (+0.50% p.a. Bonus)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
            <div className="md:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Deposit Principal (₹ INR):</span>
                  <span className="text-gold-400 font-bold">{formatINR(fdAmount)}</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={fdAmount}
                  onChange={(e) => setFdAmount(Number(e.target.value))}
                  className="w-full accent-gold-500 bg-navy-900 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>₹25,000</span>
                  <span>₹25 Lakhs</span>
                  <span>₹50 Lakhs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Tenure (Years):</span>
                  <span className="text-gold-400 font-bold">{fdYears} {fdYears === 1 ? 'Year' : 'Years'} ({fdYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={fdYears}
                  onChange={(e) => setFdYears(Number(e.target.value))}
                  className="w-full accent-gold-500 bg-navy-900 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 text-center space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Applicable Interest Rate:</span>
                  <span className="font-bold text-gold-400">{fdRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Total Maturity Value</span>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{formatINR(maturityAmount)}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs flex justify-between text-slate-300">
                  <span>Net Interest Accrual:</span>
                  <span className="font-bold text-white">+{formatINR(interestEarned)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Corporate & Regulatory Notes */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="font-bold text-white">{INDIAN_BANKING_CONSTANTS.BANK_NAME}</p>
            <p className="text-[11px] text-slate-400">{INDIAN_BANKING_CONSTANTS.HEADQUARTERS}</p>
          </div>
          <div className="text-right text-[11px] font-mono space-y-0.5">
            <p>CIN: {INDIAN_BANKING_CONSTANTS.CIN}</p>
            <p>GSTIN: {INDIAN_BANKING_CONSTANTS.GSTIN}</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Disclaimer: Capital Core Private Bank is a licensed scheduled commercial banking institution. Bank deposits are insured under the Deposit Insurance and Credit Guarantee Corporation (DICGC) up to ₹5 Lakhs per depositor. Fixed deposit interest rates are subject to periodic revision as per RBI Repo Rate changes.
        </p>
      </footer>

    </div>
  );
};
