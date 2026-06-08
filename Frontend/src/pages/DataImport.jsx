import { useState, useRef } from 'react';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { HiOutlineCloudArrowUp, HiOutlineDocumentText } from 'react-icons/hi2';

export default function DataImport() {
  const [csvFile, setCsvFile] = useState(null);
  const [xlsFile, setXlsFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const csvRef = useRef(); const xlsRef = useRef();

  const handleImportCSV = async () => {
    if (!csvFile) { toast.error('Select a CSV file first.'); return; }
    setImporting(true); setResult(null);
    try {
      const fd = new FormData(); fd.append('file', csvFile);
      const res = await API.post('/import/csv', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 });
      setResult(res.data);
      toast.success(res.data.message);
      setCsvFile(null); if (csvRef.current) csvRef.current.value = '';
      loadStatus();
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed.'); }
    finally { setImporting(false); }
  };

  const handleImportExcel = async () => {
    if (!xlsFile) { toast.error('Select an Excel file first.'); return; }
    setImporting(true);
    try {
      const fd = new FormData(); fd.append('file', xlsFile);
      const res = await API.post('/import/excel', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      setXlsFile(null); if (xlsRef.current) xlsRef.current.value = '';
      loadStatus();
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed.'); }
    finally { setImporting(false); }
  };

  const loadStatus = async () => {
    try { const r = await API.get('/import/status'); setImportStatus(r.data.data); }
    catch (err) { console.error(err); }
  };

  useState(() => { loadStatus(); }, []);

  return (
    <div className="animate-in">
      <Toaster position="top-right" />
      <div className="page-header"><h1>📂 Data Import</h1><p>Import historical delay records and equipment master data</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        {/* CSV Import */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><HiOutlineDocumentText style={{ color: 'var(--accent)' }} /> Import Delay Data (CSV)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Upload sample_delays_data.csv (~80,000 records)</p>
          <input type="file" accept=".csv" ref={csvRef} onChange={e => setCsvFile(e.target.files[0])} className="form-input" style={{ marginBottom: 12 }} />
          <button className="btn btn-primary" onClick={handleImportCSV} disabled={importing || !csvFile}>
            {importing ? 'Importing...' : '⬆️ Import CSV'}
          </button>
        </div>

        {/* Excel Import */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><HiOutlineCloudArrowUp style={{ color: 'var(--success)' }} /> Import Equipment Master (Excel)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Upload master_data.xls for equipment mapping</p>
          <input type="file" accept=".xls,.xlsx" ref={xlsRef} onChange={e => setXlsFile(e.target.files[0])} className="form-input" style={{ marginBottom: 12 }} />
          <button className="btn btn-success" onClick={handleImportExcel} disabled={importing || !xlsFile}>
            {importing ? 'Importing...' : '⬆️ Import Excel'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Import Result</h3>
          <p>✅ Success: <strong>{result.data?.successCount}</strong> | ❌ Errors: <strong>{result.data?.errorCount}</strong></p>
          {result.data?.errors?.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-dark)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--danger)', maxHeight: 200, overflow: 'auto' }}>
              {result.data.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      )}

      {importStatus && (
        <div className="kpi-grid" style={{ marginTop: 24 }}>
          <div className="kpi-card blue"><div className="kpi-label">Total Delays</div><div className="kpi-value">{importStatus.totalDelays?.toLocaleString()}</div></div>
          <div className="kpi-card green"><div className="kpi-label">Equipment Records</div><div className="kpi-value">{importStatus.totalEquipment?.toLocaleString()}</div></div>
        </div>
      )}
    </div>
  );
}
