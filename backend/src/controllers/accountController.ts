import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Account } from '../types';
import { CONFIG } from '../config';

export const getAccounts = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let accounts: Account[];
    if (req.user.role === 'admin') {
      accounts = db.prepare('SELECT * FROM accounts').all() as Account[];
    } else {
      accounts = db.prepare('SELECT * FROM accounts WHERE userId = ?').all(req.user.id) as Account[];
    }

    const cleaned = accounts.map(a => ({
      ...a,
      isPrimary: Boolean(a.isPrimary)
    }));

    return res.json(cleaned);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createVault = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { name, type = 'savings', initialDeposit = 0 } = req.body;

    if (!name) return res.status(400).json({ error: 'Vault name is required' });

    const accId = `acc_${Date.now()}`;
    const accNum = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const createdAt = new Date().toISOString();

    const upiId = `${req.user.email.split('@')[0]}@capitalcore`;
    const interestRate = type === 'fixed_deposit' ? 7.5 : 4.5;

    db.prepare(`
      INSERT INTO accounts (id, userId, accountNumber, ifscCode, micrCode, upiId, accountType, accountName, balance, currency, isPrimary, status, interestRate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 0, 'active', ?, ?)
    `).run(accId, req.user.id, accNum, CONFIG.IFSC_CODE, CONFIG.MICR_CODE, upiId, type, name, Number(initialDeposit), interestRate, createdAt);

    const created = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accId) as Account;
    return res.status(201).json({ ...created, isPrimary: Boolean(created.isPrimary) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
