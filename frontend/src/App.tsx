import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BankingProvider } from './context/BankingContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { TransfersView } from './components/TransfersView';
import { CardsView } from './components/CardsView';
import { SavingsVaultsView } from './components/SavingsVaultsView';
import { LoansView } from './components/LoansView';
import { BillsView } from './components/BillsView';
import { AdminPortalView } from './components/AdminPortalView';

import { 
  LayoutDashboard, 
  QrCode, 
  CreditCard, 
  PiggyBank, 
  ReceiptText, 
  Landmark, 
  ShieldAlert 
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040814] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Connecting to Capital Core Core-Banking CBS...</span>
      </div>
    );
  }

  if (!user || activeTab === 'landing') {
    return <LandingPage onExplore={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'dashboard')} />;
  }

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transfers', label: 'UPI Pay', icon: QrCode },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'vaults', label: 'FD Vaults', icon: PiggyBank },
    { id: 'bills', label: 'BBPS', icon: ReceiptText },
    { id: 'loans', label: 'Loans', icon: Landmark },
  ];

  if (user.role === 'admin') {
    mobileNavItems.push({ id: 'admin', label: 'RBI Desk', icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#040814] text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-6 gap-6 pb-24 md:pb-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onNavigateToTransfers={() => setActiveTab('transfers')} 
              onNavigateToCards={() => setActiveTab('cards')} 
            />
          )}
          {activeTab === 'transfers' && <TransfersView />}
          {activeTab === 'cards' && <CardsView />}
          {activeTab === 'vaults' && <SavingsVaultsView />}
          {activeTab === 'loans' && <LoansView />}
          {activeTab === 'bills' && <BillsView />}
          {activeTab === 'admin' && user.role === 'admin' && <AdminPortalView />}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'text-gold-400 font-bold scale-105' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-gold-500/15 border border-gold-500/30' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BankingProvider>
        <MainApp />
      </BankingProvider>
    </AuthProvider>
  );
}

export default App;
