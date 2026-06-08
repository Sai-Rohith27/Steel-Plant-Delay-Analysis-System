import { Router } from 'express';
import { 
  getEquipment, getShops, getAgencies, 
  getEquipmentByShop, getSubEquipment,
  getDistinctEquipment, getDistinctSubEquipment 
} from '../controllers/equipmentController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getEquipment);
router.get('/shops', auth, getShops);
router.get('/agencies', auth, getAgencies);
router.get('/shop/:shopCode', auth, getEquipmentByShop);
router.get('/shop/:shopCode/:equipment', auth, getSubEquipment);
router.get('/distinct/equipment', auth, getDistinctEquipment);
router.get('/distinct/sub-equipment', auth, getDistinctSubEquipment);

export default router;
