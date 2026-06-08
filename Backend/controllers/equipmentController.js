import pool from '../config/db.js';

// ─── GET ALL EQUIPMENT ─────────────────────────────────
export const getEquipment = async (req, res) => {
  try {
    const { shop_code, search } = req.query;
    let query = `
      SELECT e.*, s.shop_desc 
      FROM equipment_master e 
      LEFT JOIN shop_master s ON e.shop_code = s.shop_code 
      WHERE 1=1
    `;
    const params = [];

    if (shop_code) {
      query += ' AND e.shop_code = ?';
      params.push(shop_code);
    }
    if (search) {
      query += ' AND (e.equipment LIKE ? OR e.sub_equipment LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.shop_code, e.equipment';
    const [equipment] = await pool.query(query, params);

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SHOPS ─────────────────────────────────────────
export const getShops = async (req, res) => {
  try {
    const [shops] = await pool.query('SELECT * FROM shop_master ORDER BY shop_code');
    res.json({ success: true, data: shops });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET AGENCIES ──────────────────────────────────────
export const getAgencies = async (req, res) => {
  try {
    const [agencies] = await pool.query('SELECT * FROM agency_master ORDER BY agency_desc');
    res.json({ success: true, data: agencies });
  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET EQUIPMENT BY SHOP ─────────────────────────────
export const getEquipmentByShop = async (req, res) => {
  try {
    const { shopCode } = req.params;
    const [equipment] = await pool.query(
      'SELECT DISTINCT equipment FROM equipment_master WHERE shop_code = ? ORDER BY equipment',
      [shopCode]
    );
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Get equipment by shop error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SUB-EQUIPMENT ─────────────────────────────────
export const getSubEquipment = async (req, res) => {
  try {
    const { shopCode, equipment } = req.params;
    const [subEquipment] = await pool.query(
      'SELECT DISTINCT sub_equipment FROM equipment_master WHERE shop_code = ? AND equipment = ? AND sub_equipment IS NOT NULL ORDER BY sub_equipment',
      [shopCode, equipment]
    );
    res.json({ success: true, data: subEquipment });
  } catch (error) {
    console.error('Get sub-equipment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET DISTINCT EQUIPMENT FROM DELAYS (for dropdowns when master is empty) ─
export const getDistinctEquipment = async (req, res) => {
  try {
    const { shop_code } = req.query;
    let query = 'SELECT DISTINCT equipment FROM delays WHERE equipment IS NOT NULL AND equipment != ""';
    const params = [];

    if (shop_code) {
      query += ' AND shop_code = ?';
      params.push(shop_code);
    }
    query += ' ORDER BY equipment';

    const [equipment] = await pool.query(query, params);
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Get distinct equipment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getDistinctSubEquipment = async (req, res) => {
  try {
    const { shop_code, equipment } = req.query;
    let query = 'SELECT DISTINCT sub_equipment FROM delays WHERE sub_equipment IS NOT NULL AND sub_equipment != ""';
    const params = [];

    if (shop_code) { query += ' AND shop_code = ?'; params.push(shop_code); }
    if (equipment) { query += ' AND equipment = ?'; params.push(equipment); }
    query += ' ORDER BY sub_equipment';

    const [subEquipment] = await pool.query(query, params);
    res.json({ success: true, data: subEquipment });
  } catch (error) {
    console.error('Get distinct sub-equipment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
