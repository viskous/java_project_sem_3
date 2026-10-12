import { Router } from 'express';
import { getCards, createCard, toggleFreezeCard, toggleCardFeature } from '../controllers/cardController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);
router.get('/', getCards as any);
router.post('/create', createCard as any);
router.patch('/:id/toggle-freeze', toggleFreezeCard as any);
router.patch('/:id/toggle-feature', toggleCardFeature as any);

export default router;
