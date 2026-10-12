"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForLoan = exports.getLoans = void 0;
const database_1 = require("../db/database");
const getLoans = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        let loans;
        if (req.user.role === 'admin') {
            loans = database_1.db.prepare('SELECT * FROM loans ORDER BY createdAt DESC').all();
        }
        else {
            loans = database_1.db.prepare('SELECT * FROM loans WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
        }
        return res.json(loans);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getLoans = getLoans;
const applyForLoan = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { amount, termMonths, purpose, loanScheme = 'Personal Loan', annualIncome = 1200000 } = req.body;
        if (!amount || !termMonths || !purpose) {
            return res.status(400).json({ error: 'Loan principal in ₹, tenure (in months), and purpose are required' });
        }
        // Dynamic Indian CIBIL Score simulation (range 300 - 900)
        const simulatedCibilScore = Math.min(850, Math.max(680, Math.floor(740 + (annualIncome / 100000) * 4)));
        // Benchmark lending rate linked to RBI Repo Rate
        const interestRate = Number((8.25 + (850 - simulatedCibilScore) * 0.015).toFixed(2));
        // Monthly EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = Number(((amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)).toFixed(2));
        const status = simulatedCibilScore >= 750 && amount <= annualIncome * 4 ? 'approved' : 'pending';
        const loanId = `loan_${Date.now()}`;
        const createdAt = new Date().toISOString();
        database_1.db.prepare(`
      INSERT INTO loans (id, userId, applicantName, amount, termMonths, interestRate, monthlyPayment, purpose, loanScheme, status, cibilScore, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(loanId, req.user.id, req.user.fullName, amount, termMonths, interestRate, monthlyPayment, purpose, loanScheme, status, simulatedCibilScore, createdAt);
        // If auto-approved under pre-sanctioned limits, disburse to primary savings account
        if (status === 'approved') {
            const primaryAccount = database_1.db.prepare('SELECT id, accountNumber FROM accounts WHERE userId = ? AND isPrimary = 1').get(req.user.id);
            if (primaryAccount) {
                database_1.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, primaryAccount.id);
                database_1.db.prepare(`
          INSERT INTO transactions (id, toAccountId, toAccountName, amount, fee, type, paymentMode, category, description, status, referenceNumber, utrNumber, riskScore, createdAt)
          VALUES (?, ?, 'Obsidian Sovereign Savings', ?, 0, 'loan_disbursement', 'INTERNAL', 'Loan Disbursal', ?, 'completed', ?, ?, 0.0, ?)
        `).run(`tx_${Date.now()}`, primaryAccount.id, amount, `Pre-Approved ${loanScheme} Disbursal - ${purpose}`, `DISB/CC-${Date.now().toString().slice(-6)}`, `UTRDISB${Date.now().toString().slice(-8)}`, createdAt);
            }
        }
        const createdLoan = database_1.db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
        return res.status(201).json({
            message: status === 'approved'
                ? `Loan approved based on CIBIL Score ${simulatedCibilScore}! Principal of ₹${amount.toLocaleString('en-IN')} disbursed to your Savings Account.`
                : `Loan application submitted for Underwriting Committee review. Tracking ID: ${loanId}`,
            loan: createdLoan
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.applyForLoan = applyForLoan;
