import bcrypt from 'bcrypt';
import pool from '../config/db.js';

// ─── GET ALL USERS ─────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, emp_number, emp_name, department, designation, role, status, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (emp_number LIKE ? OR emp_name LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count total
    const countQuery = query.replace('SELECT id, emp_number, emp_name, department, designation, role, status, created_at, updated_at', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── ADD USER ──────────────────────────────────────────
export const addUser = async (req, res) => {
  try {
    const { emp_number, emp_name, password, department, designation, role } = req.body;

    if (!emp_number || !emp_name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee number, name, and password are required.' 
      });
    }

    // Check if employee number already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE emp_number = ?', [emp_number]);
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Employee number already exists.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (emp_number, emp_name, password, department, designation, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [emp_number, emp_name, hashedPassword, department || null, designation || null, role || 'dept_user']
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_USER', 'user', result.insertId, `Created user ${emp_name} (${emp_number})`]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { id: result.insertId, emp_number, emp_name, role: role || 'dept_user' }
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE USER ───────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { emp_name, department, designation, role, status } = req.body;

    const updates = [];
    const params = [];

    if (emp_name) { updates.push('emp_name = ?'); params.push(emp_name); }
    if (department) { updates.push('department = ?'); params.push(department); }
    if (designation) { updates.push('designation = ?'); params.push(designation); }
    if (role) { updates.push('role = ?'); params.push(role); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_USER', 'user', id, `Updated user #${id}: ${updates.join(', ')}`]
    );

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── TOGGLE USER STATUS ────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query('SELECT status, emp_name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = users[0].status === 'active' ? 'inactive' : 'active';
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'TOGGLE_STATUS', 'user', id, `${users[0].emp_name} set to ${newStatus}`]
    );

    res.json({ success: true, message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, data: { status: newStatus } });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
