import { Response } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Card, Account } from '../types';

export const getCards = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let cards: any[];
    if (req.user.role === 'admin') {
      cards = db.prepare('SELECT * FROM cards').all();
    } else {
      cards = db.prepare('SELECT * FROM cards WHERE userId = ?').all(req.user.id);
    }

    const cleaned = cards.map(c => ({
      ...c,
      isFrozen: Boolean(c.isFrozen),
      internationalEnabled: Boolean(c.internationalEnabled),
      contactlessEnabled: Boolean(c.contactlessEnabled),
      atmEnabled: Boolean(c.atmEnabled),
      ecommerceEnabled: Boolean(c.ecommerceEnabled),
      tokenized: Boolean(c.tokenized)
    }));
    return res.json(cleaned);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createCard = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { accountId, type = 'virtual', tier = 'rupay_select', network = 'RuPay', spendingLimit = 150000 } = req.body;

    const acc = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(accountId, req.user.id) as Account | undefined;
    if (!acc) {
      return res.status(404).json({ error: 'Linked account not found' });
    }

    const cardId = `crd_${Date.now()}`;
    const cardNum = `${network === 'RuPay' ? '6521' : '4920'} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const expDate = '12/29';
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const pin = '1234';
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO cards (id, accountId, userId, cardHolder, cardNumber, expDate, cvv, pin, spendingLimit, spentThisMonth, type, tier, network, isFrozen, internationalEnabled, contactlessEnabled, atmEnabled, ecommerceEnabled, tokenized, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0, 0, 1, 1, 1, 1, ?)
    `).run(cardId, acc.id, req.user.id, req.user.fullName.toUpperCase(), cardNum, expDate, cvv, pin, spendingLimit, type, tier, network, createdAt);

    const newCard = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId) as any;
    return res.status(201).json({
      ...newCard,
      isFrozen: Boolean(newCard.isFrozen),
      internationalEnabled: Boolean(newCard.internationalEnabled),
      contactlessEnabled: Boolean(newCard.contactlessEnabled),
      atmEnabled: Boolean(newCard.atmEnabled),
      ecommerceEnabled: Boolean(newCard.ecommerceEnabled),
      tokenized: Boolean(newCard.tokenized)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const toggleFreezeCard = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    const card = db.prepare('SELECT * FROM cards WHERE id = ? AND userId = ?').get(id, req.user.id) as any;
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const newFrozenStatus = card.isFrozen ? 0 : 1;
    db.prepare('UPDATE cards SET isFrozen = ? WHERE id = ?').run(newFrozenStatus, id);

    return res.json({ 
      id, 
      isFrozen: Boolean(newFrozenStatus), 
      message: newFrozenStatus ? 'Card temporarily locked as per RBI security protocol' : 'Card unlocked and active' 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const toggleCardFeature = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { feature, enabled } = req.body;

    const validFeatures = ['internationalEnabled', 'contactlessEnabled', 'atmEnabled', 'ecommerceEnabled'];
    if (!validFeatures.includes(feature)) {
      return res.status(400).json({ error: 'Invalid card security feature' });
    }

    db.prepare(`UPDATE cards SET ${feature} = ? WHERE id = ? AND userId = ?`).run(enabled ? 1 : 0, id, req.user.id);

    return res.json({ message: `Updated ${feature} setting to ${enabled ? 'Enabled' : 'Disabled'}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
