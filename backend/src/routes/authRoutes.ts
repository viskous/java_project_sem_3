import { Router } from 'express';
import { register, login, getMe, verifyPin } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT as any, getMe as any);
router.post('/verify-pin', authenticateJWT as any, verifyPin as any);

export default router;
