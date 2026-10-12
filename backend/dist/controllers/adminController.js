"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.freezeUserAccount = exports.updateLoanStatus = exports.getUsers = exports.getAdminStats = void 0;
const database_1 = require("../db/database");
const getAdminStats = (req, res) => {
    try {
        const totalDeposits = database_1.db.prepare('SELECT SUM(balance) as sum FROM accounts').get().sum || 0;
        const activeUsers = database_1.db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get().count;
        const pendingLoansCount = database_1.db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'pending'").get().count;
        const totalLoanVolume = database_1.db.prepare("SELECT SUM(amount) as sum FROM loans WHERE status = 'approved'").get().sum || 0;
        const flaggedTransactionsCount = database_1.db.prepare("SELECT COUNT(*) as count FROM transactions WHERE status = 'flagged'").get().count;
        return res.json({
            totalBankLiquidity: totalDeposits,
            activeCustomers: activeUsers,
            pendingLoans: pendingLoansCount,
            totalLoanVolume: totalLoanVolume,
            flaggedTransactions: flaggedTransactionsCount,
            reserveRatioPct: 18.5, // Indian Statutory Liquidity Ratio (SLR) + Cash Reserve Ratio (CRR)
            systemHealth: 'RBI_COMPLIANT_ACTIVE'
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getAdminStats = getAdminStats;
const getUsers = (req, res) => {
    try {
        const users = database_1.db.prepare('SELECT id, email, fullName, role, phone, panNumber, upiId, city, state, kycStatus, status, createdAt FROM users').all();
        return res.json(users);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getUsers = getUsers;
const updateLoanStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }
        const loan = database_1.db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
        if (!loan)
            return res.status(404).json({ error: 'Loan record not found' });
        database_1.db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, id);
        if (status === 'approved' && loan.status !== 'approved') {
            const primaryAcc = database_1.db.prepare('SELECT id FROM accounts WHERE userId = ? AND isPrimary = 1').get(loan.userId);
            if (primaryAcc) {
                database_1.db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(loan.amount, primaryAcc.id);
            }
        }
        database_1.db.prepare(`
      INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
      VALUES (?, ?, ?, 'LOAN_SANCTION_DECISION', ?, ?, ?)
    `).run(`aud_${Date.now()}`, req.user.id, req.user.fullName, req.ip || '127.0.0.1 (IST)', `Executive underwriting decision on loan ${id}: ${status}`, new Date().toISOString());
        return res.json({ message: `Loan successfully updated to ${status}` });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.updateLoanStatus = updateLoanStatus;
const freezeUserAccount = (req, res) => {
    try {
        const { userId, freeze } = req.body;
        const newStatus = freeze ? 'frozen' : 'active';
        database_1.db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, userId);
        database_1.db.prepare(`
      INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
      VALUES (?, ?, ?, 'COMPLIANCE_ACCOUNT_FREEZE', ?, ?, ?)
    `).run(`aud_${Date.now()}`, req.user.id, req.user.fullName, req.ip || '127.0.0.1 (IST)', `Compliance action on user ${userId}: marked ${newStatus}`, new Date().toISOString());
        return res.json({ message: `Account status updated to ${newStatus}` });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.freezeUserAccount = freezeUserAccount;
const getAuditLogs = (req, res) => {
    try {
        const logs = database_1.db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
        return res.json(logs);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getAuditLogs = getAuditLogs;
