import { Router } from 'express';
import { 
  getDashboardStats, getDeptWiseDelays, getAgencyWiseDelays,
  getMonthlyTrend, getTopDelayedEquipment, getRecentDelays, getTopDelayReasons
} from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/stats', auth, getDashboardStats);
router.get('/dept-wise', auth, getDeptWiseDelays);
router.get('/agency-wise', auth, getAgencyWiseDelays);
router.get('/monthly-trend', auth, getMonthlyTrend);
router.get('/top-equipment', auth, getTopDelayedEquipment);
router.get('/recent-delays', auth, getRecentDelays);
router.get('/top-reasons', auth, getTopDelayReasons);

export default router;
