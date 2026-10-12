import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User, AuditLog, Loan, Transaction } from '../types';

export const getAdminStats = (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalDeposits = (db.prepare('SELECT SUM(balance) as sum FROM accounts').get() as { sum: number }).sum || 0;
    const activeUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as { count: number }).count;
    const pendingLoansCount = (db.prepare("SELECT COUNT(*) as count FROM loans WHERE status = 'pending'").get() as { count: number }).count;
    const totalLoanVolume = (db.prepare("SELECT SUM(amount) as sum FROM loans WHERE status = 'approved'").get() as { sum: number }).sum || 0;
    const flaggedTransactionsCount = (db.prepare("SELECT COUNT(*) as count FROM transactions WHERE status = 'flagged'").get() as { count: number }).count;

    return res.json({
      totalBankLiquidity: totalDeposits,
      activeCustomers: activeUsers,
      pendingLoans: pendingLoansCount,
      totalLoanVolume: totalLoanVolume,
      flaggedTransactions: flaggedTransactionsCount,
      reserveRatioPct: 18.5, // Indian Statutory Liquidity Ratio (SLR) + Cash Reserve Ratio (CRR)
      systemHealth: 'RBI_COMPLIANT_ACTIVE'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUsers = (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT id, email, fullName, role, phone, panNumber, upiId, city, state, kycStatus, status, createdAt FROM users').all() as User[];
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateLoanStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id) as Loan | undefined;
    if (!loan) return res.status(404).json({ error: 'Loan record not found' });

    db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, id);

    if (status === 'approved' && loan.status !== 'approved') {
      const primaryAcc = db.prepare('SELECT id FROM accounts WHERE userId = ? AND isPrimary = 1').get(loan.userId) as { id: string } | undefined;
      if (primaryAcc) {
        db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(loan.amount, primaryAcc.id);
      }
    }

    db.prepare(`
      INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
      VALUES (?, ?, ?, 'LOAN_SANCTION_DECISION', ?, ?, ?)
    `).run(`aud_${Date.now()}`, req.user!.id, req.user!.fullName, req.ip || '127.0.0.1 (IST)', `Executive underwriting decision on loan ${id}: ${status}`, new Date().toISOString());

    return res.json({ message: `Loan successfully updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const freezeUserAccount = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, freeze } = req.body;
    const newStatus = freeze ? 'frozen' : 'active';

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, userId);

    db.prepare(`
      INSERT INTO audit_logs (id, userId, userName, action, ipAddress, details, timestamp)
      VALUES (?, ?, ?, 'COMPLIANCE_ACCOUNT_FREEZE', ?, ?, ?)
    `).run(`aud_${Date.now()}`, req.user!.id, req.user!.fullName, req.ip || '127.0.0.1 (IST)', `Compliance action on user ${userId}: marked ${newStatus}`, new Date().toISOString());

    return res.json({ message: `Account status updated to ${newStatus}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all() as AuditLog[];
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
