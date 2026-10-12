import { Router } from 'express';
import { getTransactions, createTransfer } from '../controllers/transactionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.get('/', getTransactions as any);
router.post('/transfer', createTransfer as any);

export default router;
