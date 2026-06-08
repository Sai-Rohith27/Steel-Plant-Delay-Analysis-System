import { Router } from 'express';
import { getReportData, getReportCharts, getDurationAnalysis, getAvailableYears } from '../controllers/reportController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/data', auth, getReportData);
router.get('/charts', auth, getReportCharts);
router.get('/duration-analysis', auth, getDurationAnalysis);
router.get('/years', auth, getAvailableYears);

export default router;
