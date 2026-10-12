import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Transaction, Card, Loan, Bill } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface BankingContextType {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  loans: Loan[];
  bills: Bill[];
  isLoading: boolean;
  activeAccount: Account | null;
  setActiveAccount: (acc: Account | null) => void;
  refreshBankingData: () => Promise<void>;
  totalNetWorth: number;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshBankingData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [accs, txs, crds, lns, bls] = await Promise.all([
        api.getAccounts().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getCards().catch(() => []),
        api.getLoans().catch(() => []),
        api.getBills().catch(() => [])
      ]);

      setAccounts(accs);
      setTransactions(txs);
      setCards(crds);
      setLoans(lns);
      setBills(bls);

      if (accs.length > 0 && !activeAccount) {
        setActiveAccount(accs.find(a => a.isPrimary) || accs[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshBankingData();
    } else {
      setAccounts([]);
      setTransactions([]);
      setCards([]);
      setLoans([]);
      setBills([]);
      setActiveAccount(null);
    }
  }, [user]);

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <BankingContext.Provider
      value={{
        accounts,
        transactions,
        cards,
        loans,
        bills,
        isLoading,
        activeAccount,
        setActiveAccount,
        refreshBankingData,
        totalNetWorth
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) throw new Error('useBanking must be used within BankingProvider');
  return context;
};
