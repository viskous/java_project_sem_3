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
  fullName: string;
  role: UserRole;
  phone: string; // +91 Indian Mobile
  avatarUrl?: string;
  pinCode: string;
  is2FAEnabled: boolean;
  status: 'active' | 'frozen' | 'suspended';
  panNumber?: string;
  aadhaarMasked?: string;
  upiId?: string;
  city?: string;
  state?: string;
  postalCode?: string;
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
  interestRate?: number;
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
  referenceNumber: string;
  utrNumber?: string;
  vpa?: string;
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
  interestRate: number;
  monthlyPayment: number;
  purpose: string;
  loanScheme: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  cibilScore: number;
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  serviceProvider: string;
  category: string;
  accountReference: string;
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

export interface AdminStats {
  totalBankLiquidity: number;
  activeCustomers: number;
  pendingLoans: number;
  totalLoanVolume: number;
  flaggedTransactions: number;
  reserveRatioPct: number;
  systemHealth: string;
}
