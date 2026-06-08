import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// ─── LOGIN ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { emp_number, password } = req.body;

    if (!emp_number || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee number and password are required.' 
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE emp_number = ?', 
      [emp_number]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Contact administrator.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        emp_number: user.emp_number, 
        emp_name: user.emp_name,
        role: user.role,
        department: user.department 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Log the login
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'LOGIN', `User ${user.emp_name} logged in`]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          emp_number: user.emp_number,
          emp_name: user.emp_name,
          department: user.department,
          designation: user.designation,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET PROFILE ───────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, emp_number, emp_name, department, designation, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new passwords are required.' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters.' 
      });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(current_password, users[0].password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
