import pool from '../config/db.js';

// ─── DASHBOARD KPIs ────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    // Total delays
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM delays WHERE delay_duration > 0');
    
    // By agency
    const [agencyStats] = await pool.query(`
      SELECT agency_code, COUNT(*) as count, SUM(delay_duration) as total_duration 
      FROM delays WHERE delay_duration > 0
      GROUP BY agency_code ORDER BY count DESC
    `);

    // Mechanical delays
    const mechCount = agencyStats.find(a => a.agency_code === 'M')?.count || 0;
    const elecCount = agencyStats.find(a => a.agency_code === 'E')?.count || 0;
    const sdCount = agencyStats.find(a => a.agency_code === 'SD')?.count || 0;

    // Active equipment count
    const [activeEquip] = await pool.query('SELECT COUNT(DISTINCT equipment) as count FROM delays WHERE equipment IS NOT NULL AND equipment != ""');

    res.json({
      success: true,
      data: {
        totalDelays: totalResult[0].total,
        mechanicalDelays: mechCount,
        electricalDelays: elecCount,
        shutdownDelays: sdCount,
        activeEquipment: activeEquip[0].count,
        agencyBreakdown: agencyStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DEPARTMENT WISE DELAYS ────────────────────────────
export const getDeptWiseDelays = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT s.shop_desc, d.shop_code, COUNT(*) as delay_count, 
             SUM(d.delay_duration) as total_duration,
             ROUND(AVG(d.delay_duration), 2) as avg_duration
      FROM delays d 
      LEFT JOIN shop_master s ON d.shop_code = s.shop_code 
      WHERE d.delay_duration > 0
      GROUP BY d.shop_code, s.shop_desc 
      ORDER BY delay_count DESC
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Dept wise delays error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── AGENCY WISE DELAYS ───────────────────────────────
export const getAgencyWiseDelays = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT d.agency_code, a.agency_desc, COUNT(*) as delay_count,
             SUM(d.delay_duration) as total_duration
      FROM delays d
      LEFT JOIN agency_master a ON d.agency_code = a.agency_code
      WHERE d.delay_duration > 0
      GROUP BY d.agency_code, a.agency_desc
      ORDER BY delay_count DESC
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Agency wise delays error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── MONTHLY TREND ─────────────────────────────────────
export const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    let query = `
      SELECT DATE_FORMAT(del_date, '%Y-%m') as month, 
             COUNT(*) as delay_count,
             SUM(delay_duration) as total_duration,
             ROUND(AVG(delay_duration), 2) as avg_duration
      FROM delays 
      WHERE delay_duration > 0
    `;
    const params = [];

    if (year) {
      query += ' AND YEAR(del_date) = ?';
      params.push(year);
    } else {
      // Default: last 12 months from most recent data
      query += ' AND del_date >= (SELECT DATE_SUB(MAX(del_date), INTERVAL 12 MONTH) FROM delays)';
    }

    query += ' GROUP BY month ORDER BY month';
    const [data] = await pool.query(query, params);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Monthly trend error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── TOP DELAYED EQUIPMENT ─────────────────────────────
export const getTopDelayedEquipment = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT equipment, COUNT(*) as delay_count, 
             SUM(delay_duration) as total_duration,
             ROUND(AVG(delay_duration), 2) as avg_duration
      FROM delays 
      WHERE delay_duration > 0 AND equipment IS NOT NULL AND equipment != ''
      GROUP BY equipment 
      ORDER BY total_duration DESC 
      LIMIT 10
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Top delayed equipment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── RECENT DELAYS ─────────────────────────────────────
export const getRecentDelays = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT d.*, s.shop_desc 
      FROM delays d 
      LEFT JOIN shop_master s ON d.shop_code = s.shop_code 
      WHERE d.delay_duration > 0
      ORDER BY d.del_date DESC, d.created_at DESC 
      LIMIT 10
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Recent delays error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── TOP DELAY REASONS ─────────────────────────────────
export const getTopDelayReasons = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT remarks, COUNT(*) as count, SUM(delay_duration) as total_duration
      FROM delays 
      WHERE delay_duration > 0 AND remarks IS NOT NULL AND remarks != '' 
        AND remarks != 'Don''t delete this record'
      GROUP BY remarks 
      ORDER BY count DESC 
      LIMIT 10
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Top delay reasons error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
