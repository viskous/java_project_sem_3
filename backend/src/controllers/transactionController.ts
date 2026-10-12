import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Account, Transaction } from '../types';

export const getTransactions = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let transactions: Transaction[];
    if (req.user.role === 'admin') {
      transactions = db.prepare('SELECT * FROM transactions ORDER BY createdAt DESC').all() as Transaction[];
    } else {
      const userAccountIds = (db.prepare('SELECT id FROM accounts WHERE userId = ?').all(req.user.id) as { id: string }[]).map(a => a.id);
      if (userAccountIds.length === 0) {
        return res.json([]);
      }
      const placeholders = userAccountIds.map(() => '?').join(',');
      const sql = `
        SELECT * FROM transactions 
        WHERE fromAccountId IN (${placeholders}) OR toAccountId IN (${placeholders})
        ORDER BY createdAt DESC
      `;
      transactions = db.prepare(sql).all(...userAccountIds, ...userAccountIds) as Transaction[];
    }

    return res.json(transactions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createTransfer = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { 
      fromAccountId, 
      toAccountNumber, 
      recipientName, 
      amount, 
      description, 
      category = 'Fund Transfer', 
      paymentMode = 'UPI',
      vpa,
      ifscCode,
      pin 
    } = req.body;

    if (!fromAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Source account and a valid transfer amount in ₹ (INR) are required' });
    }

    // Verify PIN
    const user = db.prepare('SELECT pinCode FROM users WHERE id = ?').get(req.user.id) as { pinCode: string };
    if (pin && user.pinCode !== pin) {
      return res.status(400).json({ error: 'Incorrect 4-digit Transaction Security PIN' });
    }

    // Verify Source Account
    const sourceAcc = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(fromAccountId, req.user.id) as Account | undefined;
    if (!sourceAcc) {
      return res.status(404).json({ error: 'Source account not found or does not belong to you' });
    }

    // Fee structure according to RBI guidelines: UPI & NEFT are free, IMPS ₹5, RTGS free for retail
    const fee = paymentMode === 'IMPS' && amount > 1000 ? 5.00 : 0.00;

    if (sourceAcc.balance < (amount + fee)) {
      return res.status(400).json({ 
        error: `Insufficient funds. Available balance: ₹${sourceAcc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
      });
    }

    // Find destination if internal
    let targetAcc: Account | undefined;
    if (toAccountNumber) {
      targetAcc = db.prepare('SELECT * FROM accounts WHERE accountNumber = ?').get(toAccountNumber) as Account | undefined;
    } else if (vpa) {
      targetAcc = db.prepare('SELECT * FROM accounts WHERE upiId = ?').get(vpa) as Account | undefined;
    }

    const txId = `tx_${Date.now()}`;
    const utrNumber = `UTR${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const refNum = paymentMode === 'UPI' ? `UPI/${utrNumber}` : `${paymentMode}/${utrNumber}`;
    const createdAt = new Date().toISOString();

    // Risk Evaluation (RBI reporting threshold > ₹10 Lakh)
    const riskScore = amount > 1000000 ? 82.5 : 2.5;
    const status = riskScore > 85 ? 'flagged' : 'completed';

    const transferTx = db.transaction(() => {
      // Debit source
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount + fee, sourceAcc.id);

      // Credit target if within Capital Core
      if (targetAcc) {
        db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, targetAcc.id);
      }

      // Ledger entry
      db.prepare(`
        INSERT INTO transactions (id, fromAccountId, toAccountId, fromAccountName, toAccountName, amount, fee, type, paymentMode, category, description, status, referenceNumber, utrNumber, vpa, riskScore, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'transfer', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        txId,
        sourceAcc.id,
        targetAcc ? targetAcc.id : null,
        sourceAcc.accountName,
        targetAcc ? targetAcc.accountName : (recipientName || vpa || toAccountNumber || 'Beneficiary Bank Account'),
        amount,
        fee,
        paymentMode,
        category,
        description || `${paymentMode} transfer to ${recipientName || vpa || toAccountNumber || 'Beneficiary'}`,
        status,
        refNum,
        utrNumber,
        vpa || null,
        riskScore,
        createdAt
      );

      // Audit Log
      db.prepare(`
        INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
        VALUES (?, ?, ?, 'TRANSFER_COMPLETED', ?, ?, ?)
      `).run(
        `aud_${Date.now()}`,
        req.user!.id,
        req.user!.fullName,
        req.ip || '127.0.0.1 (IST)',
        `${paymentMode} Payment of ₹${amount} initiated via UTR: ${utrNumber}`,
        createdAt
      );
    });

    transferTx();

    const createdTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId) as Transaction;
    return res.status(201).json({
      message: status === 'flagged' 
        ? 'Transaction logged and queued for high-value RBI compliance verification.' 
        : `Transfer successful! UTR Reference: ${utrNumber}`,
      transaction: createdTx
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
