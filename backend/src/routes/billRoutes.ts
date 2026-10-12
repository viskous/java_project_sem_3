import { Router } from 'express';
import { getBills, payBill } from '../controllers/billController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.get('/', getBills as any);
router.post('/:id/pay', payBill as any);

export default router;
