import { Router } from 'express';
import { getUsers, addUser, updateUser, toggleUserStatus } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', auth, roleCheck('sys_admin', 'dept_admin'), getUsers);
router.post('/', auth, roleCheck('sys_admin', 'dept_admin'), addUser);
router.put('/:id', auth, roleCheck('sys_admin', 'dept_admin'), updateUser);
router.patch('/:id/toggle-status', auth, roleCheck('sys_admin', 'dept_admin'), toggleUserStatus);

export default router;
