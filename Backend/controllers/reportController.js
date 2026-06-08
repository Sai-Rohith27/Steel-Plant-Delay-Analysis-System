import pool from '../config/db.js';

// ─── REPORT: TABULAR DATA ─────────────────────────────
export const getReportData = async (req, res) => {
  try {
    const { shop_code, equipment, sub_equipment, agency_code, from_date, to_date } = req.query;

    let query = `
      SELECT d.*, s.shop_desc, a.agency_desc
      FROM delays d
      LEFT JOIN shop_master s ON d.shop_code = s.shop_code
      LEFT JOIN agency_master a ON d.agency_code = a.agency_code
      WHERE d.delay_duration > 0
    `;
    const params = [];

    if (shop_code && shop_code !== 'all') { query += ' AND d.shop_code = ?'; params.push(shop_code); }
    if (equipment) { query += ' AND d.equipment = ?'; params.push(equipment); }
    if (sub_equipment) { query += ' AND d.sub_equipment = ?'; params.push(sub_equipment); }
    if (agency_code && agency_code !== 'all') { query += ' AND d.agency_code = ?'; params.push(agency_code); }
    if (from_date) { query += ' AND d.del_date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND d.del_date <= ?'; params.push(to_date); }

    query += ' ORDER BY d.del_date DESC, d.delay_duration DESC';

    const [data] = await pool.query(query, params);

    // Summary stats
    const totalRecords = data.length;
    const totalDuration = data.reduce((sum, d) => sum + parseFloat(d.delay_duration || 0), 0);
    const avgDuration = totalRecords > 0 ? (totalDuration / totalRecords).toFixed(2) : 0;

    res.json({
      success: true,
      data,
      summary: { totalRecords, totalDuration: totalDuration.toFixed(2), avgDuration }
    });
  } catch (error) {
    console.error('Report data error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── REPORT: CHART DATA ───────────────────────────────
export const getReportCharts = async (req, res) => {
  try {
    const { shop_code, from_date, to_date } = req.query;
    const params = [];
    let whereClause = 'WHERE delay_duration > 0';

    if (shop_code && shop_code !== 'all') { whereClause += ' AND d.shop_code = ?'; params.push(shop_code); }
    if (from_date) { whereClause += ' AND d.del_date >= ?'; params.push(from_date); }
    if (to_date) { whereClause += ' AND d.del_date <= ?'; params.push(to_date); }

    // Agency-wise pie chart
    const [agencyData] = await pool.query(`
      SELECT d.agency_code, a.agency_desc, COUNT(*) as count, SUM(d.delay_duration) as total
      FROM delays d LEFT JOIN agency_master a ON d.agency_code = a.agency_code
      ${whereClause}
      GROUP BY d.agency_code, a.agency_desc ORDER BY count DESC
    `, params);

    // Monthly bar chart
    const [monthlyData] = await pool.query(`
      SELECT DATE_FORMAT(d.del_date, '%Y-%m') as month, COUNT(*) as count, SUM(d.delay_duration) as total
      FROM delays d ${whereClause}
      GROUP BY month ORDER BY month
    `, params);

    // Equipment bar chart
    const [equipData] = await pool.query(`
      SELECT d.equipment, COUNT(*) as count, SUM(d.delay_duration) as total
      FROM delays d ${whereClause} AND d.equipment IS NOT NULL AND d.equipment != ''
      GROUP BY d.equipment ORDER BY total DESC LIMIT 15
    `, params);

    res.json({
      success: true,
      data: { agencyData, monthlyData, equipmentData: equipData }
    });
  } catch (error) {
    console.error('Report charts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── ANALYTICS: DURATION-WISE ──────────────────────────
export const getDurationAnalysis = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT 
        CASE 
          WHEN delay_duration > 0 AND delay_duration <= 0.5 THEN '0-30 mins'
          WHEN delay_duration > 0.5 AND delay_duration <= 1 THEN '30-60 mins'
          WHEN delay_duration > 1 AND delay_duration <= 3 THEN '1-3 hrs'
          WHEN delay_duration > 3 THEN '3+ hrs'
        END as duration_range,
        COUNT(*) as count,
        SUM(delay_duration) as total_duration
      FROM delays 
      WHERE delay_duration > 0
      GROUP BY duration_range
      ORDER BY FIELD(duration_range, '0-30 mins', '30-60 mins', '1-3 hrs', '3+ hrs')
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Duration analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── AVAILABLE YEARS ───────────────────────────────────
export const getAvailableYears = async (req, res) => {
  try {
    const [data] = await pool.query('SELECT DISTINCT YEAR(del_date) as year FROM delays ORDER BY year DESC');
    res.json({ success: true, data: data.map(d => d.year) });
  } catch (error) {
    console.error('Available years error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
