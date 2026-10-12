"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVault = exports.getAccounts = void 0;
const database_1 = require("../db/database");
const config_1 = require("../config");
const getAccounts = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        let accounts;
        if (req.user.role === 'admin') {
            accounts = database_1.db.prepare('SELECT * FROM accounts').all();
        }
        else {
            accounts = database_1.db.prepare('SELECT * FROM accounts WHERE userId = ?').all(req.user.id);
        }
        const cleaned = accounts.map(a => ({
            ...a,
            isPrimary: Boolean(a.isPrimary)
        }));
        return res.json(cleaned);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getAccounts = getAccounts;
const createVault = (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, type = 'savings', initialDeposit = 0 } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Vault name is required' });
        const accId = `acc_${Date.now()}`;
        const accNum = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const createdAt = new Date().toISOString();
        const upiId = `${req.user.email.split('@')[0]}@capitalcore`;
        const interestRate = type === 'fixed_deposit' ? 7.5 : 4.5;
        database_1.db.prepare(`
      INSERT INTO accounts (id, userId, accountNumber, ifscCode, micrCode, upiId, accountType, accountName, balance, currency, isPrimary, status, interestRate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 0, 'active', ?, ?)
    `).run(accId, req.user.id, accNum, config_1.CONFIG.IFSC_CODE, config_1.CONFIG.MICR_CODE, upiId, type, name, Number(initialDeposit), interestRate, createdAt);
        const created = database_1.db.prepare('SELECT * FROM accounts WHERE id = ?').get(accId);
        return res.status(201).json({ ...created, isPrimary: Boolean(created.isPrimary) });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.createVault = createVault;
