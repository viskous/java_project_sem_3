import { Router } from 'express';
import { getLoans, applyForLoan } from '../controllers/loanController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.get('/', getLoans as any);
router.post('/apply', applyForLoan as any);

export default router;
