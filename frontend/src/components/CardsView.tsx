import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { api } from '../services/api';
import { formatINR } from '../utils/india';
import { 
  CreditCard, 
  Snowflake, 
  Lock, 
  Plus, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';

export const CardsView: React.FC = () => {
  const { cards, accounts, refreshBankingData } = useBanking();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [revealedCVVs, setRevealedCVVs] = useState<{ [cardId: string]: boolean }>({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cardTier, setCardTier] = useState<'rupay_select' | 'obsidian_infinite' | 'corporate_platinum'>('rupay_select');
  const [network, setNetwork] = useState<'RuPay' | 'Visa' | 'Mastercard'>('RuPay');
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('physical');
  const [spendingLimit, setSpendingLimit] = useState(500000);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const handleToggleFreeze = async (cardId: string) => {
    try {
      await api.toggleFreezeCard(cardId);
      await refreshBankingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (cardId: string, feature: string, currentValue: boolean) => {
    try {
      await api.toggleCardFeature(cardId, feature, !currentValue);
      await refreshBankingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCard({
        accountId: selectedAccountId || accounts[0]?.id,
        type: cardType,
        tier: cardTier,
        network,
        spendingLimit
      });
      setShowCreateModal(false);
      await refreshBankingData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCVV = (cardId: string) => {
    setRevealedCVVs(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const getTierClass = (tier: string) => {
    if (tier === 'rupay_select') return 'card-rupay-select';
    if (tier === 'corporate_platinum') return 'card-corporate-platinum';
    return 'card-obsidian-infinite';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bank-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30 uppercase">
              RBI Mandated Controls
            </span>
            <span className="text-xs text-slate-400">Tokenized & Encrypted</span>
          </div>
          <h2 className="text-xl font-bold text-white">RuPay & Visa Metal Card Suite</h2>
          <p className="text-xs text-slate-400">Manage contactless tap limits, international usage, and instant RBI card locks.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gold-400 hover:bg-gold-300 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Metal / Virtual Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">Your Active Cards</span>
          
          {cards.map(card => {
            const isSelected = card.id === selectedCard?.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-gold-500/70 bg-navy-900 shadow-sm' 
                    : 'bank-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${isSelected ? 'text-gold-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-xs text-white">{card.cardHolder}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{card.cardNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase block ${
                      card.isFrozen ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {card.isFrozen ? 'FROZEN' : card.network || 'RuPay'}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase mt-0.5 block">{card.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Card Interactive Showcase */}
        {selectedCard && (
          <div className="lg:col-span-7 space-y-5">
            
            {/* Realistic Sovereign Metallic Card Visual */}
            <div className={`${getTierClass(selectedCard.tier)} p-7 rounded-2xl relative flex flex-col justify-between min-h-[240px]`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400 block">
                    CAPITAL CORE PRIVATE
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase">
                    {selectedCard.tier.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-white tracking-wider block">
                    {selectedCard.network || 'RuPay'}
                  </span>
                  <span className="text-[9px] text-slate-300 font-mono">GLOBAL</span>
                </div>
              </div>

              <div className="my-5">
                <span className="text-base sm:text-xl font-mono tracking-widest text-slate-100 block drop-shadow">
                  {selectedCard.cardNumber}
                </span>
              </div>

              <div className="flex justify-between items-end text-xs font-mono text-slate-200">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cardholder</span>
                  <span className="font-bold tracking-wide">{selectedCard.cardHolder}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Valid Thru</span>
                  <span className="font-bold">{selectedCard.expDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">CVV</span>
                  <span className="font-bold">
                    {revealedCVVs[selectedCard.id] ? selectedCard.cvv : '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* RBI Security Controls Box */}
            <div className="bank-card p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">RBI Mandated Card Controls</h4>
                <button
                  onClick={() => toggleCVV(selectedCard.id)}
                  className="text-xs font-semibold text-gold-400 hover:underline flex items-center gap-1"
                >
                  {revealedCVVs[selectedCard.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealedCVVs[selectedCard.id] ? 'Hide CVV' : 'Reveal CVV'}</span>
                </button>
              </div>

              {/* RBI Switches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-navy-900 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Contactless Tap & Pay</p>
                    <p className="text-[10px] text-slate-400">Up to ₹5,000 without PIN</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(selectedCard.id, 'contactlessEnabled', selectedCard.contactlessEnabled)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      selectedCard.contactlessEnabled ? 'bg-gold-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-navy-950 transition-transform ${
                      selectedCard.contactlessEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-navy-900 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">International Usage</p>
                    <p className="text-[10px] text-slate-400">Overseas ATM & POS</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(selectedCard.id, 'internationalEnabled', selectedCard.internationalEnabled)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      selectedCard.internationalEnabled ? 'bg-gold-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-navy-950 transition-transform ${
                      selectedCard.internationalEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-navy-900 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Online (E-Commerce)</p>
                    <p className="text-[10px] text-slate-400">Tokenized 3DS OTP</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(selectedCard.id, 'ecommerceEnabled', selectedCard.ecommerceEnabled)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      selectedCard.ecommerceEnabled ? 'bg-gold-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-navy-950 transition-transform ${
                      selectedCard.ecommerceEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-navy-900 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">ATM Cash Withdrawal</p>
                    <p className="text-[10px] text-slate-400">Domestic Network</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(selectedCard.id, 'atmEnabled', selectedCard.atmEnabled)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      selectedCard.atmEnabled ? 'bg-gold-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-navy-950 transition-transform ${
                      selectedCard.atmEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Instant Lock / Freeze Button */}
              <button
                onClick={() => handleToggleFreeze(selectedCard.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  selectedCard.isFrozen
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                <Snowflake className="w-4 h-4" />
                <span>{selectedCard.isFrozen ? 'Unlock Card' : 'Temporary Card Freeze (RBI Instant Lock)'}</span>
              </button>

              {/* Monthly Spending Limit */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Monthly Spending Limit:</span>
                  <span className="text-gold-400">{formatINR(selectedCard.spentThisMonth)} / {formatINR(selectedCard.spendingLimit)}</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gold-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (selectedCard.spentThisMonth / selectedCard.spendingLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Virtual Card Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bank-card p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Issue RuPay / Visa Sovereign Card</h3>

            <form onSubmit={handleCreateCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Payment Network</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['RuPay', 'Visa'] as const).map(net => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setNetwork(net)}
                      className={`p-2 rounded-xl text-center text-xs font-bold border ${
                        network === net ? 'bg-navy-900 border-gold-500 text-gold-400' : 'bg-navy-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {net === 'RuPay' ? 'RuPay (India Domestic + UPI)' : 'Visa Infinite (Global)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Card Form Factor</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  <option value="physical">Physical Sovereign Metal Card (Delivered via BlueDart)</option>
                  <option value="virtual">Virtual Instant Online Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Spending Limit (₹ INR)</label>
                <input
                  type="number"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold"
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
                  {isSubmitting ? 'Issuing...' : 'Generate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
