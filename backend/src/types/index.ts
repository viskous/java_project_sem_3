export type UserRole = 'consumer' | 'business' | 'admin';

export type AccountType = 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'investment';

export type PaymentMode = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'BBPS' | 'CARD' | 'INTERNAL';

export type TransactionType = 'transfer' | 'deposit' | 'withdrawal' | 'card_payment' | 'bill_pay' | 'loan_disbursement' | 'fd_interest';

export type TransactionStatus = 'completed' | 'pending' | 'flagged' | 'declined';

export type CardType = 'virtual' | 'physical';

export type CardTier = 'rupay_select' | 'obsidian_infinite' | 'corporate_platinum';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phone: string; // Indian Mobile +91
  avatarUrl?: string;
  pinCode: string; // 4-digit ATM/App PIN
  is2FAEnabled: boolean;
  status: 'active' | 'frozen' | 'suspended';
  panNumber?: string; // e.g. ABCPS1234F
  aadhaarMasked?: string; // e.g. •••• •••• 8820
  upiId?: string; // e.g. aditya@capitalcore
  city?: string;
  state?: string;
  postalCode?: string; // 6-digit Indian PIN Code
  kycStatus?: 'verified' | 'pending' | 'in_progress';
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  micrCode: string;
  upiId?: string;
  accountType: AccountType;
  accountName: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  status: 'active' | 'frozen' | 'closed';
  interestRate?: number; // e.g. 7.25% for FD, 4.5% for Savings
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromAccountName?: string;
  toAccountName?: string;
  amount: number;
  fee: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  category: string;
  description: string;
  status: TransactionStatus;
  referenceNumber: string; // Ref or UTR #
  utrNumber?: string; // Unique Transaction Reference (Indian Banking UTR)
  vpa?: string; // Virtual Payment Address / UPI ID
  riskScore?: number;
  createdAt: string;
}

export interface Card {
  id: string;
  accountId: string;
  userId: string;
  cardHolder: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
  pin: string;
  spendingLimit: number;
  spentThisMonth: number;
  type: CardType;
  tier: CardTier;
  network: 'RuPay' | 'Visa' | 'Mastercard';
  isFrozen: boolean;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
  atmEnabled: boolean;
  ecommerceEnabled: boolean;
  tokenized: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  applicantName: string;
  amount: number;
  termMonths: number;
  interestRate: number; // in % p.a.
  monthlyPayment: number; // EMI (Equated Monthly Installment)
  purpose: string;
  loanScheme: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  cibilScore: number; // 300 - 900
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  serviceProvider: string;
  category: string;
  accountReference: string; // Consumer ID / CA Number / Mobile / FASTag Tag ID
  amount: number;
  dueDate: string;
  autoPay: boolean;
  status: 'unpaid' | 'paid' | 'overdue';
  billerLogo?: string;
  bbpsRef?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}
