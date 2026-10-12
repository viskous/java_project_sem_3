import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Bill, Account } from '../types';

export const getBills = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const bills = db.prepare('SELECT * FROM bills WHERE userId = ?').all(req.user.id) as Bill[];
    const cleaned = bills.map(b => ({ ...b, autoPay: Boolean(b.autoPay) }));
    return res.json(cleaned);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const payBill = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { fromAccountId } = req.body;

    const bill = db.prepare('SELECT * FROM bills WHERE id = ? AND userId = ?').get(id, req.user.id) as Bill | undefined;
    if (!bill) return res.status(404).json({ error: 'Bill reference not found' });

    const account = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(fromAccountId, req.user.id) as Account | undefined;
    if (!account) return res.status(400).json({ error: 'Select a valid payment account' });

    if (account.balance < bill.amount) {
      return res.status(400).json({ error: 'Insufficient funds in selected account' });
    }

    db.transaction(() => {
      // Deduct balance
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(bill.amount, account.id);
      // Mark bill paid
      db.prepare("UPDATE bills SET status = 'paid' WHERE id = ?").run(id);
      // Add ledger transaction
      db.prepare(`
        INSERT INTO transactions (id, fromAccountId, fromAccountName, toAccountName, amount, fee, type, category, description, status, referenceNumber, riskScore, createdAt)
        VALUES (?, ?, ?, ?, ?, 0, 'bill_pay', ?, ?, 'completed', ?, 0.5, ?)
      `).run(`tx_${Date.now()}`, account.id, account.accountName, bill.serviceProvider, bill.amount, bill.category, `Bill Pay - ${bill.serviceProvider}`, `REF-BIL-${Date.now().toString().slice(-6)}`, new Date().toISOString());
    })();

    return res.json({ message: `Successfully paid ₹${bill.amount} to ${bill.serviceProvider}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
