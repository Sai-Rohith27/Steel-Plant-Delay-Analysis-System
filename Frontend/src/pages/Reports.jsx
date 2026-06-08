import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Bar, Pie, Line } from 'react-chartjs-2';

const COLORS = ['#4682B4','#00D4FF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F97316','#06B6D4','#84CC16'];
const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94A3B8', font: { size: 11 } } } },
  scales: { x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' } } }
};

export default function Reports() {
  const [shops, setShops] = useState([]);
  const [filters, setFilters] = useState({ shop_code: 'all', from_date: '', to_date: '' });
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [tab, setTab] = useState('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => { API.get('/equipment/shops').then(r => setShops(r.data.data)).catch(console.error); }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const [dataRes, chartRes] = await Promise.all([
        API.get(`/reports/data?${params}`),
        API.get(`/reports/charts?${params}`)
      ]);
      setData(dataRes.data.data);
      setSummary(dataRes.data.summary);
      setCharts(chartRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const agencyChart = {
    labels: charts.agencyData?.map(a => a.agency_desc || a.agency_code) || [],
    datasets: [{ data: charts.agencyData?.map(a => a.count) || [], backgroundColor: COLORS, borderWidth: 0 }]
  };

  const monthlyChart = {
    labels: charts.monthlyData?.map(m => m.month) || [],
    datasets: [{ label: 'Delays', data: charts.monthlyData?.map(m => m.count) || [], borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.1)', fill: true, tension: 0.4 }]
  };

  const equipChart = {
    labels: charts.equipmentData?.map(e => e.equipment) || [],
    datasets: [{ label: 'Total Duration', data: charts.equipmentData?.map(e => e.total) || [], backgroundColor: COLORS, borderRadius: 6 }]
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1>📈 Reports</h1><p>Generate and analyze delay reports</p></div>

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Shop</label>
          <select className="form-select" value={filters.shop_code} onChange={e => setFilters(p => ({ ...p, shop_code: e.target.value }))}>
            <option value="all">All Shops</option>
            {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_desc}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">From Date</label>
          <input type="date" className="form-input" value={filters.from_date} onChange={e => setFilters(p => ({ ...p, from_date: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">To Date</label>
          <input type="date" className="form-input" value={filters.to_date} onChange={e => setFilters(p => ({ ...p, to_date: e.target.value }))} />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" onClick={loadReport} disabled={loading}>
            {loading ? 'Loading...' : '🔍 Generate Report'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'table' ? 'active' : ''}`} onClick={() => setTab('table')}>📋 Table</button>
        <button className={`tab ${tab === 'charts' ? 'active' : ''}`} onClick={() => setTab('charts')}>📊 Charts</button>
        <button className={`tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>📑 Summary</button>
      </div>

      {/* Summary Stats */}
      {summary.totalRecords > 0 && (
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          <div className="kpi-card blue"><div className="kpi-label">Records</div><div className="kpi-value">{summary.totalRecords?.toLocaleString()}</div></div>
          <div className="kpi-card yellow"><div className="kpi-label">Total Hours</div><div className="kpi-value">{parseFloat(summary.totalDuration).toLocaleString()}</div></div>
          <div className="kpi-card green"><div className="kpi-label">Avg Duration</div><div className="kpi-value">{summary.avgDuration}h</div></div>
        </div>
      )}

      {tab === 'table' && (
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Equipment</th><th>Agency</th><th>Duration</th><th>Description</th></tr></thead>
            <tbody>
              {data.slice(0, 200).map((d, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{d.del_date ? new Date(d.del_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td style={{ fontWeight: 500 }}>{d.equipment || '-'}</td>
                  <td><span className="badge badge-info">{d.agency_desc || d.agency_code}</span></td>
                  <td>{d.delay_duration}h</td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.remarks || '-'}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Click "Generate Report" to load data</td></tr>}
            </tbody>
          </table>
          {data.length > 200 && <p style={{ padding: 12, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Showing 200 of {data.length} records</p>}
        </div>
      )}

      {tab === 'charts' && (
        <div className="charts-grid">
          <div className="chart-card"><h3>Agency Distribution</h3><div style={{ height: 300 }}>{charts.agencyData?.length > 0 ? <Pie data={agencyChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94A3B8' } } } }} /> : <p className="empty-state">No data</p>}</div></div>
          <div className="chart-card"><h3>Monthly Trend</h3><div style={{ height: 300 }}>{charts.monthlyData?.length > 0 ? <Line data={monthlyChart} options={chartOpts} /> : <p className="empty-state">No data</p>}</div></div>
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}><h3>Equipment-Wise Duration</h3><div style={{ height: 300 }}>{charts.equipmentData?.length > 0 ? <Bar data={equipChart} options={chartOpts} /> : <p className="empty-state">No data</p>}</div></div>
        </div>
      )}

      {tab === 'summary' && summary.totalRecords > 0 && (
        <div className="card"><p style={{ color: 'var(--text-secondary)' }}>Total <strong>{summary.totalRecords}</strong> delay records with <strong>{summary.totalDuration}</strong> total hours. Average delay duration: <strong>{summary.avgDuration}h</strong> per incident.</p></div>
      )}
    </div>
  );
}
