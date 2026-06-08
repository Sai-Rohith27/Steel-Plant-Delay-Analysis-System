import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  // Connect without database first to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  console.log('🔧 Setting up Vizag Steel Plant Database...\n');

  // Create database
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'vizag_steel'}\``);
  await connection.query(`USE \`${process.env.DB_NAME || 'vizag_steel'}\``);
  console.log('✅ Database created/verified');

  // ─── USERS TABLE ─────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_number VARCHAR(20) UNIQUE NOT NULL,
      emp_name VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      designation VARCHAR(100),
      role ENUM('sys_admin', 'dept_admin', 'dept_user', 'ppm_admin', 'ppm_user') DEFAULT 'dept_user',
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table created');

  // ─── SHOP MASTER TABLE ───────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shop_master (
      shop_code INT PRIMARY KEY,
      shop_desc VARCHAR(100) NOT NULL
    )
  `);
  console.log('✅ Shop master table created');

  // Insert default shop codes
  const shops = [
    [1, 'RMHP - Raw Material Handling Plant'],
    [2, 'CO & CCP - Coke Ovens & Coal Chemical Plant'],
    [3, 'COCCP - Coke Oven Coal Chemical Plant'],
    [4, 'SP - Sinter Plant'],
    [5, 'BF - Blast Furnace'],
    [6, 'SMS - Steel Melting Shop'],
    [7, 'LMMM/Bar Mill - Light & Medium Merchant Mill'],
    [8, 'WRM - Wire Rod Mill'],
    [9, 'MMSM - Medium Merchant & Structural Mill'],
    [10, 'POWER - Power Plant / GETS'],
    [12, 'ELECTRICAL - Electrical Services'],
    [15, 'SPECIAL - Special Equipment / TBDB']
  ];

  for (const [code, desc] of shops) {
    await connection.query(
      'INSERT IGNORE INTO shop_master (shop_code, shop_desc) VALUES (?, ?)',
      [code, desc]
    );
  }
  console.log('✅ Shop master data inserted');

  // ─── EQUIPMENT MASTER TABLE ──────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS equipment_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      shop_code INT NOT NULL,
      equipment VARCHAR(100) NOT NULL,
      sub_equipment VARCHAR(100),
      FOREIGN KEY (shop_code) REFERENCES shop_master(shop_code),
      INDEX idx_shop_code (shop_code),
      INDEX idx_equipment (equipment)
    )
  `);
  console.log('✅ Equipment master table created');

  // ─── DELAYS TABLE ────────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS delays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      del_date DATE NOT NULL,
      shop_code INT NOT NULL,
      material VARCHAR(50),
      rake VARCHAR(50),
      delay_from DECIMAL(5,2),
      delay_to DECIMAL(5,2),
      delay_duration DECIMAL(8,2) DEFAULT 0,
      cum_delay DECIMAL(10,2) DEFAULT 0,
      equipment VARCHAR(100),
      sub_equipment VARCHAR(100),
      remarks TEXT,
      delay_det_code VARCHAR(20),
      agency_code VARCHAR(10),
      delay_freq INT DEFAULT 1,
      continued VARCHAR(5),
      expected_doc VARCHAR(50),
      eff_duration DECIMAL(10,6) DEFAULT 0,
      entered_by VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_by VARCHAR(50),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_code) REFERENCES shop_master(shop_code),
      INDEX idx_del_date (del_date),
      INDEX idx_shop_code (shop_code),
      INDEX idx_agency (agency_code),
      INDEX idx_equipment (equipment),
      INDEX idx_date_shop (del_date, shop_code)
    )
  `);
  console.log('✅ Delays table created');

  // ─── AGENCY MASTER TABLE ─────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS agency_master (
      agency_code VARCHAR(10) PRIMARY KEY,
      agency_desc VARCHAR(100) NOT NULL
    )
  `);

  const agencies = [
    ['O', 'Operations'],
    ['M', 'Mechanical'],
    ['E', 'Electrical'],
    ['SD', 'Shutdown'],
    ['S', 'Shift/Services'],
    ['C', 'Common/Change'],
    ['ID', 'Idle'],
    ['I', 'Instrumentation'],
    ['P', 'Power'],
    ['MIS', 'Miscellaneous'],
    ['CR', 'Capital Repair'],
    ['MS', 'Material Shortage']
  ];

  for (const [code, desc] of agencies) {
    await connection.query(
      'INSERT IGNORE INTO agency_master (agency_code, agency_desc) VALUES (?, ?)',
      [code, desc]
    );
  }
  console.log('✅ Agency master data inserted');

  // ─── AUDIT LOG TABLE ─────────────────────────────────
  await connection.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50),
      entity_id INT,
      details TEXT,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_action (action),
      INDEX idx_created (created_at)
    )
  `);
  console.log('✅ Audit logs table created');

  // ─── DEFAULT ADMIN USER ──────────────────────────────
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.default.hash('admin123', 10);
  await connection.query(
    `INSERT IGNORE INTO users (emp_number, emp_name, password, department, designation, role, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['ADMIN001', 'System Administrator', hashedPassword, 'IT', 'Admin', 'sys_admin', 'active']
  );
  console.log('✅ Default admin user created (emp: ADMIN001, pwd: admin123)');

  console.log('\n🎉 Database setup complete!');
  await connection.end();
  process.exit(0);
};

setupDatabase().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
