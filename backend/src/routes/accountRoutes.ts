import { Router } from 'express';
import { getAccounts, createVault } from '../controllers/accountController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.get('/', getAccounts as any);
router.post('/create-vault', createVault as any);

export default router;
