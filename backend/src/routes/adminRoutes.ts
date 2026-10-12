import { Router } from 'express';
import { getAdminStats, getUsers, updateLoanStatus, freezeUserAccount, getAuditLogs } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.use(requireRole(['admin']) as any);

router.get('/stats', getAdminStats as any);
router.get('/users', getUsers as any);
router.patch('/loans/:id', updateLoanStatus as any);
router.post('/freeze-user', freezeUserAccount as any);
router.get('/audit-logs', getAuditLogs as any);

export default router;
