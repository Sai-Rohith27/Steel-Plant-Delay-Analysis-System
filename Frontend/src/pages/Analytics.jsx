import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

const COLORS = ['#4682B4','#00D4FF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F97316','#06B6D4','#84CC16'];
const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94A3B8' } } }, scales: { x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(255,255,255,0.04)' } } } };

export default function Analytics() {
  const [deptData, setDeptData] = useState([]);
  const [agencyData, setAgencyData] = useState([]);
  const [durationData, setDurationData] = useState([]);
  const [topEquip, setTopEquip] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/dept-wise'),
      API.get('/dashboard/agency-wise'),
      API.get('/reports/duration-analysis'),
      API.get('/dashboard/top-equipment')
    ]).then(([d, a, dur, te]) => {
      setDeptData(d.data.data); setAgencyData(a.data.data);
      setDurationData(dur.data.data); setTopEquip(te.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>📉 Delay Analytics</h1><p>Advanced analysis across shops, equipment, agencies and duration</p></div>
      <div className="charts-grid">
        <div className="chart-card"><h3>🏭 Shop-Wise Delays</h3><div style={{height:300}}><Bar data={{ labels: deptData.map(d => d.shop_desc?.split(' - ')[0] || `Shop ${d.shop_code}`), datasets: [{ label: 'Count', data: deptData.map(d => d.delay_count), backgroundColor: COLORS, borderRadius: 6 }] }} options={chartOpts} /></div></div>
        <div className="chart-card"><h3>🔧 Agency-Wise</h3><div style={{height:300}}><Doughnut data={{ labels: agencyData.map(a => a.agency_desc || a.agency_code), datasets: [{ data: agencyData.map(a => a.delay_count), backgroundColor: COLORS, borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94A3B8' } } } }} /></div></div>
        <div className="chart-card"><h3>⏱ Duration-Wise</h3><div style={{height:300}}><Pie data={{ labels: durationData.map(d => d.duration_range), datasets: [{ data: durationData.map(d => d.count), backgroundColor: ['#10B981','#F59E0B','#EF4444','#8B5CF6'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94A3B8' } } } }} /></div></div>
        <div className="chart-card"><h3>⚙️ Top Equipment by Duration</h3><div style={{height:300}}><Bar data={{ labels: topEquip.map(e => e.equipment), datasets: [{ label: 'Total Hours', data: topEquip.map(e => parseFloat(e.total_duration)), backgroundColor: '#00D4FF', borderRadius: 6 }] }} options={{...chartOpts, indexAxis: 'y'}} /></div></div>
      </div>
    </div>
  );
}
