import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { importCSV, importExcel, getImportStatus } from '../controllers/importController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv', '.xls', '.xlsx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed.'));
    }
  }
});

const router = Router();

router.post('/csv', auth, roleCheck('sys_admin', 'dept_admin'), upload.single('file'), importCSV);
router.post('/excel', auth, roleCheck('sys_admin', 'dept_admin'), upload.single('file'), importExcel);
router.get('/status', auth, getImportStatus);

export default router;
