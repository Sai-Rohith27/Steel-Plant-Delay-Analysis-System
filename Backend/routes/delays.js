import { Router } from 'express';
import { addDelay, getDelays, getDelayById, updateDelay, deleteDelay } from '../controllers/delayController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', auth, getDelays);
router.get('/:id', auth, getDelayById);
router.post('/', auth, addDelay);
router.put('/:id', auth, updateDelay);
router.delete('/:id', auth, roleCheck('sys_admin', 'dept_admin'), deleteDelay);

export default router;
