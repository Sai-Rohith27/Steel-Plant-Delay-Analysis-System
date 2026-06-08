import pool from '../config/db.js';

// ─── ADD DELAY ─────────────────────────────────────────
export const addDelay = async (req, res) => {
  try {
    const { 
      del_date, shop_code, equipment, sub_equipment, 
      agency_code, delay_from, delay_to, delay_duration,
      remarks, material, rake, delay_det_code,
      eff_duration, cum_delay, delay_freq, continued, expected_doc
    } = req.body;

    if (!del_date || !shop_code || !agency_code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date, shop, and agency are required.' 
      });
    }

    // Auto-calculate duration if not provided
    let calcDuration = delay_duration;
    if (!calcDuration && delay_from !== undefined && delay_to !== undefined) {
      calcDuration = delay_to >= delay_from 
        ? (delay_to - delay_from) 
        : (24 - delay_from + delay_to);
    }

    const [result] = await pool.query(
      `INSERT INTO delays (del_date, shop_code, equipment, sub_equipment, agency_code, 
        delay_from, delay_to, delay_duration, remarks, material, rake, delay_det_code,
        eff_duration, cum_delay, delay_freq, continued, expected_doc, entered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [del_date, shop_code, equipment || null, sub_equipment || null, agency_code,
       delay_from || 0, delay_to || 0, calcDuration || 0, remarks || null,
       material || null, rake || null, delay_det_code || null,
       eff_duration || 0, cum_delay || 0, delay_freq || 1, continued || null, expected_doc || null,
       req.user.emp_number]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_DELAY', 'delay', result.insertId, `New delay in shop ${shop_code}`]
    );

    res.status(201).json({
      success: true,
      message: 'Delay entry added successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add delay error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET DELAYS (with filters & pagination) ────────────
export const getDelays = async (req, res) => {
  try {
    const { 
      shop_code, equipment, agency_code, sub_equipment,
      from_date, to_date, search,
      page = 1, limit = 25, sort_by = 'del_date', sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT d.*, s.shop_desc 
      FROM delays d 
      LEFT JOIN shop_master s ON d.shop_code = s.shop_code 
      WHERE 1=1
    `;
    const params = [];

    if (shop_code && shop_code !== 'all') {
      query += ' AND d.shop_code = ?';
      params.push(shop_code);
    }
    if (equipment) {
      query += ' AND d.equipment LIKE ?';
      params.push(`%${equipment}%`);
    }
    if (sub_equipment) {
      query += ' AND d.sub_equipment LIKE ?';
      params.push(`%${sub_equipment}%`);
    }
    if (agency_code && agency_code !== 'all') {
      query += ' AND d.agency_code = ?';
      params.push(agency_code);
    }
    if (from_date) {
      query += ' AND d.del_date >= ?';
      params.push(from_date);
    }
    if (to_date) {
      query += ' AND d.del_date <= ?';
      params.push(to_date);
    }
    if (search) {
      query += ' AND (d.remarks LIKE ? OR d.equipment LIKE ? OR d.sub_equipment LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    // Count
    const countQuery = query.replace(/SELECT d\.\*, s\.shop_desc/, 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Sort & paginate
    const allowedSorts = ['del_date', 'shop_code', 'delay_duration', 'agency_code', 'equipment', 'created_at'];
    const sortField = allowedSorts.includes(sort_by) ? sort_by : 'del_date';
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY d.${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [delays] = await pool.query(query, params);

    res.json({
      success: true,
      data: delays,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get delays error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SINGLE DELAY ──────────────────────────────────
export const getDelayById = async (req, res) => {
  try {
    const [delays] = await pool.query(
      `SELECT d.*, s.shop_desc FROM delays d 
       LEFT JOIN shop_master s ON d.shop_code = s.shop_code 
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (delays.length === 0) {
      return res.status(404).json({ success: false, message: 'Delay not found.' });
    }

    res.json({ success: true, data: delays[0] });
  } catch (error) {
    console.error('Get delay error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE DELAY ──────────────────────────────────────
export const updateDelay = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'del_date', 'shop_code', 'equipment', 'sub_equipment',
      'agency_code', 'delay_from', 'delay_to', 'delay_duration',
      'remarks', 'material', 'rake', 'delay_det_code',
      'eff_duration', 'cum_delay', 'delay_freq', 'continued', 'expected_doc'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    updates.push('modified_by = ?');
    params.push(req.user.emp_number);
    params.push(id);

    await pool.query(`UPDATE delays SET ${updates.join(', ')} WHERE id = ?`, params);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_DELAY', 'delay', id, `Updated delay #${id}`]
    );

    res.json({ success: true, message: 'Delay updated successfully.' });
  } catch (error) {
    console.error('Update delay error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE DELAY (Admin Only) ─────────────────────────
export const deleteDelay = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM delays WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Delay not found.' });
    }

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_DELAY', 'delay', id, `Deleted delay #${id}`]
    );

    res.json({ success: true, message: 'Delay deleted successfully.' });
  } catch (error) {
    console.error('Delete delay error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
