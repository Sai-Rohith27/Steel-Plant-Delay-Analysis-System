import { useState, useEffect } from 'react';
import API from '../api/axios';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function EquipmentMaster() {
  const [equipment, setEquipment] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopFilter, setShopFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/equipment/shops').then(r => setShops(r.data.data)).catch(console.error); loadEquipment(); }, []);

  const loadEquipment = async (shop = '', q = '') => {
    try {
      const res = await API.get(`/equipment?shop_code=${shop}&search=${q}`);
      setEquipment(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEquipment(shopFilter, search); }, [shopFilter, search]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>🏭 Equipment Master</h1><p>View and manage equipment master data</p></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ maxWidth: 250 }} value={shopFilter} onChange={e => setShopFilter(e.target.value)}>
          <option value="">All Shops</option>
          {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_desc}</option>)}
        </select>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Shop</th><th>Equipment</th><th>Sub Equipment</th></tr></thead>
          <tbody>
            {equipment.map((e, i) => (
              <tr key={i}><td><span className="badge badge-primary">{e.shop_desc?.split(' - ')[0] || e.shop_code}</span></td><td style={{ fontWeight: 500 }}>{e.equipment}</td><td>{e.sub_equipment || '-'}</td></tr>
            ))}
            {equipment.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No equipment data. Import master data from Data Import page.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
