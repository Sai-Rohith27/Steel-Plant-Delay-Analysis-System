import { useState, useEffect } from 'react';
import API from '../api/axios';
import { HiOutlineClock, HiOutlineWrench, HiOutlineBolt, HiOutlineExclamationTriangle, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94A3B8', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 11 }, padding: 12 } } }
};

const COLORS = ['#4682B4', '#00D4FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [agencyData, setAgencyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topEquip, setTopEquip] = useState([]);
  const [topReasons, setTopReasons] = useState([]);
  const [recentDelays, setRecentDelays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [s, d, a, m, te, td, tr] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/dept-wise'),
        API.get('/dashboard/agency-wise'),
        API.get('/dashboard/monthly-trend'),
        API.get('/dashboard/top-equipment'),
        API.get('/dashboard/top-reasons'),
        API.get('/dashboard/recent-delays')
      ]);
      setStats(s.data.data);
      setDeptData(d.data.data);
      setAgencyData(a.data.data);
      setMonthlyData(m.data.data);
      setTopEquip(te.data.data);
      setTopReasons(td.data.data);
      setRecentDelays(tr.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const deptChartData = {
    labels: deptData.map(d => d.shop_desc?.split(' - ')[0] || `Shop ${d.shop_code}`),
    datasets: [{
      label: 'Delay Count',
      data: deptData.map(d => d.delay_count),
      backgroundColor: COLORS.slice(0, deptData.length),
      borderRadius: 6
    }]
  };

  const agencyChartData = {
    labels: agencyData.map(a => a.agency_desc || a.agency_code),
    datasets: [{
      data: agencyData.map(a => a.delay_count),
      backgroundColor: COLORS.slice(0, agencyData.length),
      borderWidth: 0
    }]
  };

  const monthlyChartData = {
    labels: monthlyData.map(m => m.month),
    datasets: [{
      label: 'Delays',
      data: monthlyData.map(m => m.delay_count),
      borderColor: '#00D4FF',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3
    }]
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time overview of equipment delays across all departments</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <span className="kpi-icon"><HiOutlineClock /></span>
          <div className="kpi-label">Total Delays</div>
          <div className="kpi-value">{stats?.totalDelays?.toLocaleString() || 0}</div>
          <div className="kpi-sub">All recorded delays</div>
        </div>
        <div className="kpi-card yellow">
          <span className="kpi-icon"><HiOutlineWrench /></span>
          <div className="kpi-label">Mechanical</div>
          <div className="kpi-value">{stats?.mechanicalDelays?.toLocaleString() || 0}</div>
          <div className="kpi-sub">Mechanical agency delays</div>
        </div>
        <div className="kpi-card red">
          <span className="kpi-icon"><HiOutlineBolt /></span>
          <div className="kpi-label">Electrical</div>
          <div className="kpi-value">{stats?.electricalDelays?.toLocaleString() || 0}</div>
          <div className="kpi-sub">Electrical agency delays</div>
        </div>
        <div className="kpi-card green">
          <span className="kpi-icon"><HiOutlineExclamationTriangle /></span>
          <div className="kpi-label">Shutdown</div>
          <div className="kpi-value">{stats?.shutdownDelays?.toLocaleString() || 0}</div>
          <div className="kpi-sub">Shutdown delays</div>
        </div>
        <div className="kpi-card cyan">
          <span className="kpi-icon"><HiOutlineCog6Tooth /></span>
          <div className="kpi-label">Active Equipment</div>
          <div className="kpi-value">{stats?.activeEquipment?.toLocaleString() || 0}</div>
          <div className="kpi-sub">Unique equipment tracked</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Department-Wise Delays</h3>
          <div style={{ height: 280 }}>
            {deptData.length > 0 ? <Bar data={deptChartData} options={chartOptions} /> : <p className="empty-state">No data</p>}
          </div>
        </div>
        <div className="chart-card">
          <h3>🔧 Agency-Wise Distribution</h3>
          <div style={{ height: 280 }}>
            {agencyData.length > 0 ? <Pie data={agencyChartData} options={pieOptions} /> : <p className="empty-state">No data</p>}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="chart-card" style={{ marginBottom: 28 }}>
        <h3>📈 Monthly Delay Trend</h3>
        <div style={{ height: 280 }}>
          {monthlyData.length > 0 ? <Line data={monthlyChartData} options={chartOptions} /> : <p className="empty-state">No data</p>}
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="charts-grid">
        {/* Top Delayed Equipment */}
        <div className="chart-card">
          <h3>⚠️ Top Delayed Equipment</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Equipment</th><th>Count</th><th>Total Hrs</th></tr></thead>
              <tbody>
                {topEquip.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{e.equipment}</td>
                    <td><span className="badge badge-info">{e.delay_count}</span></td>
                    <td>{parseFloat(e.total_duration).toFixed(1)}</td>
                  </tr>
                ))}
                {topEquip.length === 0 && <tr><td colSpan={3} style={{textAlign:'center', color:'var(--text-muted)'}}>No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Delays */}
        <div className="chart-card">
          <h3>🕐 Recent Delays</h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Date</th><th>Equipment</th><th>Duration</th><th>Agency</th></tr></thead>
              <tbody>
                {recentDelays.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.8rem' }}>{d.del_date ? new Date(d.del_date).toLocaleDateString('en-IN') : '-'}</td>
                    <td style={{ fontWeight: 500 }}>{d.equipment || '-'}</td>
                    <td>{d.delay_duration}h</td>
                    <td><span className={`badge ${d.agency_code === 'M' ? 'badge-warning' : d.agency_code === 'E' ? 'badge-danger' : 'badge-info'}`}>{d.agency_code}</span></td>
                  </tr>
                ))}
                {recentDelays.length === 0 && <tr><td colSpan={4} style={{textAlign:'center', color:'var(--text-muted)'}}>No data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
