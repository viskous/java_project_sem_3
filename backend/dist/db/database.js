"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const dbPath = path_1.default.join(__dirname, '../../capital_core.db');
const db = new better_sqlite3_1.default(dbPath);
exports.db = db;
db.pragma('journal_mode = WAL');
function initDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatarUrl TEXT,
      pinCode TEXT NOT NULL,
      is2FAEnabled INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      panNumber TEXT,
      aadhaarMasked TEXT,
      upiId TEXT,
      city TEXT,
      state TEXT,
      postalCode TEXT,
      kycStatus TEXT NOT NULL DEFAULT 'verified',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accountNumber TEXT UNIQUE NOT NULL,
      ifscCode TEXT NOT NULL,
      micrCode TEXT NOT NULL,
      upiId TEXT,
      accountType TEXT NOT NULL,
      accountName TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      isPrimary INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      interestRate REAL DEFAULT 4.5,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      fromAccountId TEXT,
      toAccountId TEXT,
      fromAccountName TEXT,
      toAccountName TEXT,
      amount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      paymentMode TEXT NOT NULL DEFAULT 'UPI',
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      referenceNumber TEXT NOT NULL,
      utrNumber TEXT,
      vpa TEXT,
      riskScore REAL DEFAULT 5.0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      userId TEXT NOT NULL,
      cardHolder TEXT NOT NULL,
      cardNumber TEXT NOT NULL,
      expDate TEXT NOT NULL,
      cvv TEXT NOT NULL,
      pin TEXT NOT NULL,
      spendingLimit REAL NOT NULL,
      spentThisMonth REAL NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      tier TEXT NOT NULL,
      network TEXT NOT NULL DEFAULT 'RuPay',
      isFrozen INTEGER NOT NULL DEFAULT 0,
      internationalEnabled INTEGER NOT NULL DEFAULT 0,
      contactlessEnabled INTEGER NOT NULL DEFAULT 1,
      atmEnabled INTEGER NOT NULL DEFAULT 1,
      ecommerceEnabled INTEGER NOT NULL DEFAULT 1,
      tokenized INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      applicantName TEXT NOT NULL,
      amount REAL NOT NULL,
      termMonths INTEGER NOT NULL,
      interestRate REAL NOT NULL,
      monthlyPayment REAL NOT NULL,
      purpose TEXT NOT NULL,
      loanScheme TEXT NOT NULL DEFAULT 'Personal Loan',
      status TEXT NOT NULL DEFAULT 'pending',
      cibilScore INTEGER NOT NULL DEFAULT 750,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      serviceProvider TEXT NOT NULL,
      category TEXT NOT NULL,
      accountReference TEXT NOT NULL,
      amount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      autoPay INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      bbpsRef TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      action TEXT NOT NULL,
      ipAddress TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
    seedDatabase();
}
function seedDatabase() {
    const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
    if (userCount > 0)
        return;
    console.log('🇮🇳 Seeding Capital Core Banking Database with realistic Indian Market Data...');
    const defaultPassword = bcryptjs_1.default.hashSync('password123', 10);
    const adminPassword = bcryptjs_1.default.hashSync('adminpassword', 10);
    // 1. Users (Local Indian profiles preserving testing emails)
    const adityaUser = {
        id: 'usr_alex_01',
        email: 'alex@capitalcore.com', // Keeps original test login working seamlessly
        passwordHash: defaultPassword,
        fullName: 'Aditya Sharma',
        role: 'consumer',
        phone: '+91 98201 44520',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        pinCode: '1234',
        is2FAEnabled: true,
        status: 'active',
        panNumber: 'ABCPS1234F',
        aadhaarMasked: '•••• •••• 8820',
        upiId: 'aditya@capitalcore',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        kycStatus: 'verified',
        createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    };
    const businessUser = {
        id: 'usr_apex_02',
        email: 'business@capitalcore.com',
        passwordHash: defaultPassword,
        fullName: 'Apex Technologies India Pvt Ltd',
        role: 'business',
        phone: '+91 98860 12345',
        avatarUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150',
        pinCode: '9999',
        is2FAEnabled: true,
        status: 'active',
        panNumber: 'AAACA1234M',
        aadhaarMasked: 'GSTIN: 29AAACA1234M1Z5',
        upiId: 'apex.india@capitalcore',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        kycStatus: 'verified',
        createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    };
    const adminUser = {
        id: 'usr_admin_00',
        email: 'admin@capitalcore.com',
        passwordHash: adminPassword,
        fullName: 'Vikramaditya Singhania (Executive Director & RBI Compliance)',
        role: 'admin',
        phone: '+91 22 2288 4400',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        pinCode: '0000',
        is2FAEnabled: true,
        status: 'active',
        panNumber: 'ABVPS9901R',
        aadhaarMasked: '•••• •••• 1049',
        upiId: 'compliance@capitalcore',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400021',
        kycStatus: 'verified',
        createdAt: new Date(Date.now() - 720 * 86400000).toISOString(),
    };
    const insertUser = db.prepare(`
    INSERT INTO users (id, email, passwordHash, fullName, role, phone, avatarUrl, pinCode, is2FAEnabled, status, panNumber, aadhaarMasked, upiId, city, state, postalCode, kycStatus, createdAt)
    VALUES (@id, @email, @passwordHash, @fullName, @role, @phone, @avatarUrl, @pinCode, @is2FAEnabled, @status, @panNumber, @aadhaarMasked, @upiId, @city, @state, @postalCode, @kycStatus, @createdAt)
  `);
    insertUser.run({ ...adityaUser, is2FAEnabled: 1 });
    insertUser.run({ ...businessUser, is2FAEnabled: 1 });
    insertUser.run({ ...adminUser, is2FAEnabled: 1 });
    // 2. Accounts (Indian IFSC & Rupee Denominations)
    const adityaSavings = {
        id: 'acc_alex_chk',
        userId: adityaUser.id,
        accountNumber: '884929401049',
        ifscCode: config_1.CONFIG.IFSC_CODE,
        micrCode: config_1.CONFIG.MICR_CODE,
        upiId: 'aditya@capitalcore',
        accountType: 'savings',
        accountName: 'Obsidian Sovereign Savings Account',
        balance: 248500.42,
        currency: 'INR',
        isPrimary: true,
        status: 'active',
        interestRate: 4.5,
        createdAt: adityaUser.createdAt,
    };
    const adityaFD = {
        id: 'acc_alex_svg',
        userId: adityaUser.id,
        accountNumber: '884929402088',
        ifscCode: config_1.CONFIG.IFSC_CODE,
        micrCode: config_1.CONFIG.MICR_CODE,
        upiId: 'aditya.fd@capitalcore',
        accountType: 'fixed_deposit',
        accountName: 'Tax-Saver Privilege Fixed Deposit (7.50% p.a.)',
        balance: 1400000.00,
        currency: 'INR',
        isPrimary: false,
        status: 'active',
        interestRate: 7.5,
        createdAt: adityaUser.createdAt,
    };
    const adityaWealth = {
        id: 'acc_alex_inv',
        userId: adityaUser.id,
        accountNumber: '884929403052',
        ifscCode: config_1.CONFIG.IFSC_CODE,
        micrCode: config_1.CONFIG.MICR_CODE,
        upiId: 'aditya.wealth@capitalcore',
        accountType: 'investment',
        accountName: 'Nifty 50 Wealth & Sovereign Gold Portfolio',
        balance: 650000.15,
        currency: 'INR',
        isPrimary: false,
        status: 'active',
        interestRate: 12.4,
        createdAt: adityaUser.createdAt,
    };
    const bizCurrent = {
        id: 'acc_biz_chk',
        userId: businessUser.id,
        accountNumber: '990144108800',
        ifscCode: config_1.CONFIG.IFSC_CODE,
        micrCode: config_1.CONFIG.MICR_CODE,
        upiId: 'apex.india@capitalcore',
        accountType: 'current',
        accountName: 'Commercial Operations Current Account',
        balance: 14500000.00,
        currency: 'INR',
        isPrimary: true,
        status: 'active',
        interestRate: 0.0,
        createdAt: businessUser.createdAt,
    };
    const insertAccount = db.prepare(`
    INSERT INTO accounts (id, userId, accountNumber, ifscCode, micrCode, upiId, accountType, accountName, balance, currency, isPrimary, status, interestRate, createdAt)
    VALUES (@id, @userId, @accountNumber, @ifscCode, @micrCode, @upiId, @accountType, @accountName, @balance, @currency, @isPrimary, @status, @interestRate, @createdAt)
  `);
    const saveAccount = (acc, isPrimary = 0) => {
        insertAccount.run({
            ...acc,
            upiId: acc.upiId ?? null,
            interestRate: acc.interestRate ?? 0,
            isPrimary: isPrimary,
        });
    };
    saveAccount(adityaSavings, 1);
    saveAccount(adityaFD, 0);
    saveAccount(adityaWealth, 0);
    saveAccount(bizCurrent, 1);
    // 3. Transactions (Indian UPI, IMPS, NEFT, BBPS ledger)
    const mockTransactions = [
        {
            id: 'tx_101',
            fromAccountId: adityaSavings.id,
            fromAccountName: 'Obsidian Sovereign Savings',
            toAccountName: 'Swiggy Gourmet Mumbai',
            amount: 1850.00,
            fee: 0,
            type: 'card_payment',
            paymentMode: 'UPI',
            category: 'Dining & Food',
            description: 'UPI Payment - Order #SWIGGY-9921',
            status: 'completed',
            referenceNumber: 'UPI/428901928301',
            utrNumber: 'UTR428901928301',
            vpa: 'swiggy@icici',
            riskScore: 1.0,
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
            id: 'tx_102',
            fromAccountName: 'Tata Consultancy Services Ltd',
            toAccountId: adityaSavings.id,
            toAccountName: 'Obsidian Sovereign Savings',
            amount: 185000.00,
            fee: 0,
            type: 'transfer',
            paymentMode: 'NEFT',
            category: 'Salary & Income',
            description: 'Executive Salary NEFT Direct Credit',
            status: 'completed',
            referenceNumber: 'NEFT/N104928190283',
            utrNumber: 'UTRN104928190283',
            riskScore: 0.2,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
            id: 'tx_103',
            fromAccountId: adityaSavings.id,
            fromAccountName: 'Obsidian Sovereign Savings',
            toAccountId: adityaFD.id,
            toAccountName: 'Tax-Saver Privilege Fixed Deposit',
            amount: 50000.00,
            fee: 0,
            type: 'transfer',
            paymentMode: 'INTERNAL',
            category: 'Investment & FD',
            description: 'Recurring Deposit Monthly Auto-Debit',
            status: 'completed',
            referenceNumber: 'INT/CC-FD-003921',
            riskScore: 0.1,
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
            id: 'tx_104',
            fromAccountId: adityaSavings.id,
            fromAccountName: 'Obsidian Sovereign Savings',
            toAccountName: 'Adani Electricity Mumbai Ltd',
            amount: 4280.00,
            fee: 0,
            type: 'bill_pay',
            paymentMode: 'BBPS',
            category: 'Electricity & Utilities',
            description: 'BBPS Utility Bill - CA #102938491',
            status: 'completed',
            referenceNumber: 'BBPS/BOM/99201948',
            utrNumber: 'UTRBBPS99201948',
            riskScore: 0.5,
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
            id: 'tx_105',
            fromAccountId: adityaSavings.id,
            fromAccountName: 'Obsidian Sovereign Savings',
            toAccountName: 'Bandra Realty Corp (Landlord)',
            amount: 65000.00,
            fee: 5.00,
            type: 'transfer',
            paymentMode: 'IMPS',
            category: 'Housing & Rent',
            description: 'IMPS 24x7 Fund Transfer - Monthly Apartment Rent',
            status: 'completed',
            referenceNumber: 'IMPS/409218201948',
            utrNumber: 'UTR409218201948',
            riskScore: 2.1,
            createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
        {
            id: 'tx_106',
            fromAccountName: 'Offshore Ventures Corp (Dubai)',
            toAccountId: adityaSavings.id,
            toAccountName: 'Obsidian Sovereign Savings',
            amount: 1250000.00,
            fee: 250.00,
            type: 'transfer',
            paymentMode: 'RTGS',
            category: 'High-Value Inward Remittance',
            description: 'Cross-Border Inward Remittance (FIRC Pending)',
            status: 'flagged',
            referenceNumber: 'RTGS/HDFC/99102941',
            utrNumber: 'UTRRTGS99102941',
            riskScore: 88.5,
            createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        }
    ];
    const insertTx = db.prepare(`
    INSERT INTO transactions (id, fromAccountId, toAccountId, fromAccountName, toAccountName, amount, fee, type, paymentMode, category, description, status, referenceNumber, utrNumber, vpa, riskScore, createdAt)
    VALUES (@id, @fromAccountId, @toAccountId, @fromAccountName, @toAccountName, @amount, @fee, @type, @paymentMode, @category, @description, @status, @referenceNumber, @utrNumber, @vpa, @riskScore, @createdAt)
  `);
    for (const tx of mockTransactions) {
        insertTx.run({
            ...tx,
            fromAccountId: tx.fromAccountId ?? null,
            toAccountId: tx.toAccountId ?? null,
            fromAccountName: tx.fromAccountName ?? null,
            toAccountName: tx.toAccountName ?? null,
            utrNumber: tx.utrNumber ?? null,
            vpa: tx.vpa ?? null,
            riskScore: tx.riskScore ?? 5.0,
        });
    }
    // 4. Cards (RuPay Select Metal & Visa Infinite)
    const adityaRuPayCard = {
        id: 'crd_alex_rupay',
        accountId: adityaSavings.id,
        userId: adityaUser.id,
        cardHolder: 'ADITYA SHARMA',
        cardNumber: '6521 •••• •••• 8812',
        expDate: '12/29',
        cvv: '849',
        pin: '1234',
        spendingLimit: 500000.00,
        spentThisMonth: 38400.00,
        type: 'physical',
        tier: 'rupay_select',
        network: 'RuPay',
        isFrozen: false,
        internationalEnabled: false,
        contactlessEnabled: true,
        atmEnabled: true,
        ecommerceEnabled: true,
        tokenized: true,
        createdAt: adityaUser.createdAt,
    };
    const adityaVisaCard = {
        id: 'crd_alex_visa',
        accountId: adityaSavings.id,
        userId: adityaUser.id,
        cardHolder: 'ADITYA SHARMA (VIRTUAL)',
        cardNumber: '4920 •••• •••• 3341',
        expDate: '09/28',
        cvv: '109',
        pin: '1234',
        spendingLimit: 150000.00,
        spentThisMonth: 12500.00,
        type: 'virtual',
        tier: 'obsidian_infinite',
        network: 'Visa',
        isFrozen: false,
        internationalEnabled: true,
        contactlessEnabled: true,
        atmEnabled: false,
        ecommerceEnabled: true,
        tokenized: true,
        createdAt: adityaUser.createdAt,
    };
    const insertCard = db.prepare(`
    INSERT INTO cards (id, accountId, userId, cardHolder, cardNumber, expDate, cvv, pin, spendingLimit, spentThisMonth, type, tier, network, isFrozen, internationalEnabled, contactlessEnabled, atmEnabled, ecommerceEnabled, tokenized, createdAt)
    VALUES (@id, @accountId, @userId, @cardHolder, @cardNumber, @expDate, @cvv, @pin, @spendingLimit, @spentThisMonth, @type, @tier, @network, @isFrozen, @internationalEnabled, @contactlessEnabled, @atmEnabled, @ecommerceEnabled, @tokenized, @createdAt)
  `);
    insertCard.run({ ...adityaRuPayCard, isFrozen: 0, internationalEnabled: 0, contactlessEnabled: 1, atmEnabled: 1, ecommerceEnabled: 1, tokenized: 1 });
    insertCard.run({ ...adityaVisaCard, isFrozen: 0, internationalEnabled: 1, contactlessEnabled: 1, atmEnabled: 0, ecommerceEnabled: 1, tokenized: 1 });
    // 5. Loans (Indian CIBIL and EMI calculations)
    const mockLoans = [
        {
            id: 'loan_01',
            userId: adityaUser.id,
            applicantName: 'Aditya Sharma',
            amount: 4500000.00,
            termMonths: 180, // 15 years
            interestRate: 8.50, // 8.5% p.a.
            monthlyPayment: 44320.00,
            purpose: 'Luxury Residential Apartment, Powai',
            loanScheme: 'Home Loan',
            status: 'approved',
            cibilScore: 785,
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
        {
            id: 'loan_02',
            userId: businessUser.id,
            applicantName: 'Apex Technologies India Pvt Ltd',
            amount: 25000000.00, // ₹2.5 Cr
            termMonths: 60,
            interestRate: 9.25,
            monthlyPayment: 521940.00,
            purpose: 'Bengaluru Tech Park Expansion & Data Center Infrastructure',
            loanScheme: 'Business MSME Credit Line',
            status: 'pending',
            cibilScore: 820,
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        }
    ];
    const insertLoan = db.prepare(`
    INSERT INTO loans (id, userId, applicantName, amount, termMonths, interestRate, monthlyPayment, purpose, loanScheme, status, cibilScore, createdAt)
    VALUES (@id, @userId, @applicantName, @amount, @termMonths, @interestRate, @monthlyPayment, @purpose, @loanScheme, @status, @cibilScore, @createdAt)
  `);
    for (const loan of mockLoans) {
        insertLoan.run(loan);
    }
    // 6. Bills (Bharat Bill Payment System BBPS)
    const mockBills = [
        {
            id: 'bill_01',
            userId: adityaUser.id,
            serviceProvider: 'Adani Electricity Mumbai Limited',
            category: 'Electricity (BBPS)',
            accountReference: 'CA-102938491',
            amount: 4280.00,
            dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
            autoPay: true,
            status: 'unpaid',
            bbpsRef: 'BBPS-MH-2026-991',
        },
        {
            id: 'bill_02',
            userId: adityaUser.id,
            serviceProvider: 'Jio Fiber Ultra Broadband',
            category: 'Broadband & Telecom',
            accountReference: '022-26489012',
            amount: 1499.00,
            dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
            autoPay: true,
            status: 'unpaid',
            bbpsRef: 'BBPS-TEL-44102',
        },
        {
            id: 'bill_03',
            userId: adityaUser.id,
            serviceProvider: 'ICICI FASTag Electronic Toll',
            category: 'FASTag National Toll',
            accountReference: 'VRN-MH02CP4920',
            amount: 2500.00,
            dueDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
            autoPay: false,
            status: 'unpaid',
            bbpsRef: 'BBPS-FASTAG-8812',
        }
    ];
    const insertBill = db.prepare(`
    INSERT INTO bills (id, userId, serviceProvider, category, accountReference, amount, dueDate, autoPay, status, bbpsRef)
    VALUES (@id, @userId, @serviceProvider, @category, @accountReference, @amount, @dueDate, @autoPay, @status, @bbpsRef)
  `);
    for (const bill of mockBills) {
        insertBill.run({ ...bill, autoPay: bill.autoPay ? 1 : 0 });
    }
    // 7. Audit logs
    const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
    VALUES (@id, @userId, @userName, @action, @ipAddress, @details, @timestamp)
  `);
    insertAudit.run({
        id: 'aud_1',
        userId: adityaUser.id,
        userName: adityaUser.fullName,
        action: 'LOGIN_SUCCESS',
        ipAddress: '103.21.124.9 (Mumbai ISP)',
        details: 'Authenticated via 2FA & Biometric Device from Bandra, Mumbai',
        timestamp: new Date().toISOString(),
    });
    console.log('🇮🇳 Database successfully initialized and seeded with Indian Banking data!');
}
