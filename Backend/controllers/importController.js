import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import pool from '../config/db.js';

// ─── IMPORT CSV DELAYS DATA ───────────────────────────
export const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const results = [];
    let errorCount = 0;
    let successCount = 0;
    const errors = [];

    // Parse CSV
    const parsePromise = new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await parsePromise;

    // Batch insert
    const batchSize = 500;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];

      for (const row of batch) {
        try {
          // Parse date: DD-MM-YYYY to YYYY-MM-DD
          let delDate = null;
          if (row.DEL_DATE) {
            const parts = row.DEL_DATE.split('-');
            if (parts.length === 3) {
              delDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          if (!delDate || !row.SHOP_CODE) {
            errorCount++;
            continue;
          }

          placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          values.push(
            delDate,
            parseInt(row.SHOP_CODE) || 0,
            row.MATERIAL || null,
            row.RAKE || null,
            parseFloat(row.DELAY_FROM) || 0,
            parseFloat(row.DELAY_TO) || 0,
            parseFloat(row.DELAY_DURN) || 0,
            parseFloat(row.CUM_DELAY) || 0,
            row.EQPT || null,
            row.SUB_EQPT || null,
            row.REMARKS || null,
            row.DELAY_DET_CODE || null,
            row.AGENCY_CODE || null,
            parseInt(row.DELAY_FREQ) || 1,
            row.CONTINUED || null,
            parseFloat(row.EFF_DURATION) || 0
          );
          successCount++;
        } catch (e) {
          errorCount++;
          if (errors.length < 20) errors.push(`Row ${i + batch.indexOf(row) + 2}: ${e.message}`);
        }
      }

      if (placeholders.length > 0) {
        await pool.query(
          `INSERT INTO delays (del_date, shop_code, material, rake, delay_from, delay_to, 
            delay_duration, cum_delay, equipment, sub_equipment, remarks, delay_det_code, 
            agency_code, delay_freq, continued, eff_duration)
           VALUES ${placeholders.join(', ')}`,
          values
        );
      }
    }

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'IMPORT_CSV', `Imported ${successCount} records, ${errorCount} errors`]
    );

    res.json({
      success: true,
      message: `Import complete. ${successCount} records imported, ${errorCount} errors.`,
      data: { successCount, errorCount, errors: errors.slice(0, 20) }
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ success: false, message: 'Import failed: ' + error.message });
  }
};

// ─── IMPORT EXCEL MASTER DATA ──────────────────────────
export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        const shopCode = row.SHOP_CODE || row.shop_code || row['Shop Code'];
        const equipment = row.EQPT || row.equipment || row['Equipment'] || row.EQUIPMENT;
        const subEquipment = row.SUB_EQPT || row.sub_equipment || row['Sub Equipment'] || row.SUB_EQUIPMENT;

        if (!shopCode || !equipment) {
          errorCount++;
          continue;
        }

        await pool.query(
          'INSERT IGNORE INTO equipment_master (shop_code, equipment, sub_equipment) VALUES (?, ?, ?)',
          [parseInt(shopCode), equipment, subEquipment || null]
        );
        successCount++;
      } catch (e) {
        errorCount++;
      }
    }

    fs.unlinkSync(req.file.path);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'IMPORT_EXCEL', `Imported ${successCount} equipment records`]
    );

    res.json({
      success: true,
      message: `Import complete. ${successCount} records imported, ${errorCount} errors.`,
      data: { successCount, errorCount }
    });
  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ success: false, message: 'Import failed: ' + error.message });
  }
};

// ─── GET IMPORT STATUS ─────────────────────────────────
export const getImportStatus = async (req, res) => {
  try {
    const [delayCount] = await pool.query('SELECT COUNT(*) as count FROM delays');
    const [equipCount] = await pool.query('SELECT COUNT(*) as count FROM equipment_master');
    const [logs] = await pool.query(
      "SELECT * FROM audit_logs WHERE action LIKE 'IMPORT_%' ORDER BY created_at DESC LIMIT 10"
    );

    res.json({
      success: true,
      data: {
        totalDelays: delayCount[0].count,
        totalEquipment: equipCount[0].count,
        recentImports: logs
      }
    });
  } catch (error) {
    console.error('Import status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
