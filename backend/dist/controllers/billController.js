"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payBill = exports.getBills = void 0;
const database_1 = require("../db/database");
const getBills = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const bills = database_1.db.prepare('SELECT * FROM bills WHERE userId = ?').all(req.user.id);
        const cleaned = bills.map(b => ({ ...b, autoPay: Boolean(b.autoPay) }));
        return res.json(cleaned);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getBills = getBills;
const payBill = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const { fromAccountId } = req.body;
        const bill = database_1.db.prepare('SELECT * FROM bills WHERE id = ? AND userId = ?').get(id, req.user.id);
        if (!bill)
            return res.status(404).json({ error: 'Bill reference not found' });
        const account = database_1.db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(fromAccountId, req.user.id);
        if (!account)
            return res.status(400).json({ error: 'Select a valid payment account' });
        if (account.balance < bill.amount) {
            return res.status(400).json({ error: 'Insufficient funds in selected account' });
        }
        database_1.db.transaction(() => {
            // Deduct balance
            database_1.db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(bill.amount, account.id);
            // Mark bill paid
            database_1.db.prepare("UPDATE bills SET status = 'paid' WHERE id = ?").run(id);
            // Add ledger transaction
            database_1.db.prepare(`
        INSERT INTO transactions (id, fromAccountId, fromAccountName, toAccountName, amount, fee, type, category, description, status, referenceNumber, riskScore, createdAt)
        VALUES (?, ?, ?, ?, ?, 0, 'bill_pay', ?, ?, 'completed', ?, 0.5, ?)
      `).run(`tx_${Date.now()}`, account.id, account.accountName, bill.serviceProvider, bill.amount, bill.category, `Bill Pay - ${bill.serviceProvider}`, `REF-BIL-${Date.now().toString().slice(-6)}`, new Date().toISOString());
        })();
        return res.json({ message: `Successfully paid ₹${bill.amount} to ${bill.serviceProvider}` });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.payBill = payBill;
