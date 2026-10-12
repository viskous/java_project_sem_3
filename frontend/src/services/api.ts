import { User, Account, Transaction, Card, Loan, Bill, AuditLog, AdminStats } from '../types';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('capital_core_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (payload: { 
    email: string; 
    password: string; 
    fullName: string; 
    phone?: string; 
    pinCode: string;
    panNumber?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<User>('/auth/me'),

  verifyPin: (pin: string) =>
    request<{ valid: boolean }>('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin })
    }),

  // Accounts
  getAccounts: () => request<Account[]>('/accounts'),

  createVault: (name: string, type: string, initialDeposit: number) =>
    request<Account>('/accounts/create-vault', {
      method: 'POST',
      body: JSON.stringify({ name, type, initialDeposit })
    }),

  // Transactions
  getTransactions: () => request<Transaction[]>('/transactions'),

  createTransfer: (payload: {
    fromAccountId: string;
    toAccountNumber?: string;
    recipientName?: string;
    amount: number;
    description?: string;
    category?: string;
    paymentMode?: string;
    vpa?: string;
    ifscCode?: string;
    pin?: string;
  }) =>
    request<{ message: string; transaction: Transaction }>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Cards
  getCards: () => request<Card[]>('/cards'),

  createCard: (payload: { accountId: string; type: string; tier: string; network?: string; spendingLimit: number }) =>
    request<Card>('/cards/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  toggleFreezeCard: (id: string) =>
    request<{ id: string; isFrozen: boolean; message: string }>(`/cards/${id}/toggle-freeze`, {
      method: 'PATCH'
    }),

  toggleCardFeature: (id: string, feature: string, enabled: boolean) =>
    request<{ message: string }>(`/cards/${id}/toggle-feature`, {
      method: 'PATCH',
      body: JSON.stringify({ feature, enabled })
    }),

  // Loans
  getLoans: () => request<Loan[]>('/loans'),

  applyForLoan: (payload: { amount: number; termMonths: number; purpose: string; loanScheme?: string; annualIncome?: number }) =>
    request<{ message: string; loan: Loan }>('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Bills
  getBills: () => request<Bill[]>('/bills'),

  payBill: (billId: string, fromAccountId: string) =>
    request<{ message: string }>(`/bills/${billId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ fromAccountId })
    }),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),

  getAdminUsers: () => request<User[]>('/admin/users'),

  updateLoanStatus: (loanId: string, status: 'approved' | 'rejected') =>
    request<{ message: string }>(`/admin/loans/${loanId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  freezeUserAccount: (userId: string, freeze: boolean) =>
    request<{ message: string }>('/admin/freeze-user', {
      method: 'POST',
      body: JSON.stringify({ userId, freeze })
    }),

  getAuditLogs: () => request<AuditLog[]>('/admin/audit-logs')
};
