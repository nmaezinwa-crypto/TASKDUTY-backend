import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', protect, AuthController.getProfile);
router.put('/profile', protect, AuthController.updateProfile);

export default router;