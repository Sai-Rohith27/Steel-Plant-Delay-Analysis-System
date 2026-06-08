import { Router } from 'express';
import { login, getProfile, changePassword } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/change-password', auth, changePassword);

export default router;
