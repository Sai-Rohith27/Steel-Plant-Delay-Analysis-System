import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function DelayEntry() {
  const [shops, setShops] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [subEquipments, setSubEquipments] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    shop_code: '', equipment: '', sub_equipment: '',
    agency_code: '', delay_from_date: '', delay_from_time: '',
    delay_to_date: '', delay_to_time: '', remarks: ''
  });

  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    calculateDuration();
  }, [form.delay_from_date, form.delay_from_time, form.delay_to_date, form.delay_to_time]);

  useEffect(() => {
    if (form.shop_code) loadEquipments(form.shop_code);
    else { setEquipments([]); setSubEquipments([]); }
  }, [form.shop_code]);

  useEffect(() => {
    if (form.shop_code && form.equipment) loadSubEquipments(form.shop_code, form.equipment);
    else setSubEquipments([]);
  }, [form.equipment]);

  const loadMasterData = async () => {
    try {
      const [shopRes, agencyRes] = await Promise.all([
        API.get('/equipment/shops'),
        API.get('/equipment/agencies')
      ]);
      setShops(shopRes.data.data);
      setAgencies(agencyRes.data.data);
    } catch (err) {
      console.error('Load master data error:', err);
    }
  };

  const loadEquipments = async (shopCode) => {
    try {
      const res = await API.get(`/equipment/distinct/equipment?shop_code=${shopCode}`);
      setEquipments(res.data.data);
    } catch (err) {
      console.error('Load equipment error:', err);
    }
  };

  const loadSubEquipments = async (shopCode, equipment) => {
    try {
      const res = await API.get(`/equipment/distinct/sub-equipment?shop_code=${shopCode}&equipment=${equipment}`);
      setSubEquipments(res.data.data);
    } catch (err) {
      console.error('Load sub-equipment error:', err);
    }
  };

  const calculateDuration = () => {
    const { delay_from_date, delay_from_time, delay_to_date, delay_to_time } = form;
    if (delay_from_date && delay_from_time && delay_to_date && delay_to_time) {
      const from = new Date(`${delay_from_date}T${delay_from_time}`);
      const to = new Date(`${delay_to_date}T${delay_to_time}`);
      const diffMs = to - from;
      if (diffMs >= 0) {
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        setDuration(`${hrs}h ${mins}m`);
      } else {
        setDuration('Invalid range');
      }
    } else {
      setDuration('');
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClear = () => {
    setForm({
      shop_code: '', equipment: '', sub_equipment: '',
      agency_code: '', delay_from_date: '', delay_from_time: '',
      delay_to_date: '', delay_to_time: '', remarks: ''
    });
    setDuration('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.shop_code || !form.agency_code || !form.delay_from_date || !form.delay_to_date) {
      toast.error('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const from = new Date(`${form.delay_from_date}T${form.delay_from_time || '00:00'}`);
      const to = new Date(`${form.delay_to_date}T${form.delay_to_time || '00:00'}`);
      const diffHrs = (to - from) / 3600000;

      await API.post('/delays', {
        del_date: form.delay_from_date,
        shop_code: parseInt(form.shop_code),
        equipment: form.equipment || null,
        sub_equipment: form.sub_equipment || null,
        agency_code: form.agency_code,
        delay_from: parseFloat(form.delay_from_time?.replace(':', '.')) || 0,
        delay_to: parseFloat(form.delay_to_time?.replace(':', '.')) || 0,
        delay_duration: parseFloat(diffHrs.toFixed(2)),
        eff_duration: parseFloat(diffHrs.toFixed(6)),
        remarks: form.remarks
      });

      toast.success('Delay entry added successfully!');
      handleClear();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add delay entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <Toaster position="top-right" />
      <div className="page-header">
        <h1>⏱ Delay Entry</h1>
        <p>Record new equipment delay incident</p>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSubmit} id="delay-entry-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {/* Shop */}
            <div className="form-group">
              <label className="form-label" htmlFor="shop_code">Shop Description *</label>
              <select id="shop_code" name="shop_code" className="form-select" value={form.shop_code} onChange={handleChange} required>
                <option value="">Select Shop</option>
                {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_desc}</option>)}
              </select>
            </div>

            {/* Equipment */}
            <div className="form-group">
              <label className="form-label" htmlFor="equipment">Equipment Name</label>
              <select id="equipment" name="equipment" className="form-select" value={form.equipment} onChange={handleChange}>
                <option value="">Select Equipment</option>
                {equipments.map((e, i) => <option key={i} value={e.equipment}>{e.equipment}</option>)}
              </select>
            </div>

            {/* Sub Equipment */}
            <div className="form-group">
              <label className="form-label" htmlFor="sub_equipment">Sub Equipment Name</label>
              <select id="sub_equipment" name="sub_equipment" className="form-select" value={form.sub_equipment} onChange={handleChange}>
                <option value="">Select Sub Equipment</option>
                {subEquipments.map((s, i) => <option key={i} value={s.sub_equipment}>{s.sub_equipment}</option>)}
              </select>
            </div>

            {/* Agency */}
            <div className="form-group">
              <label className="form-label" htmlFor="agency_code">Agency *</label>
              <select id="agency_code" name="agency_code" className="form-select" value={form.agency_code} onChange={handleChange} required>
                <option value="">Select Agency</option>
                {agencies.map(a => <option key={a.agency_code} value={a.agency_code}>{a.agency_desc} ({a.agency_code})</option>)}
              </select>
            </div>

            {/* Delay From */}
            <div className="form-group">
              <label className="form-label" htmlFor="delay_from_date">Delay From *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="delay_from_date" name="delay_from_date" type="date" className="form-input" value={form.delay_from_date} onChange={handleChange} required style={{ flex: 1 }} />
                <input name="delay_from_time" type="time" className="form-input" value={form.delay_from_time} onChange={handleChange} style={{ flex: 1 }} />
              </div>
            </div>

            {/* Delay Upto */}
            <div className="form-group">
              <label className="form-label" htmlFor="delay_to_date">Delay Upto *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="delay_to_date" name="delay_to_date" type="date" className="form-input" value={form.delay_to_date} onChange={handleChange} required style={{ flex: 1 }} />
                <input name="delay_to_time" type="time" className="form-input" value={form.delay_to_time} onChange={handleChange} style={{ flex: 1 }} />
              </div>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label className="form-label">Delay Duration</label>
              <input type="text" className="form-input" value={duration} disabled placeholder="Auto calculated" />
            </div>
          </div>

          {/* Description - full width */}
          <div className="form-group">
            <label className="form-label" htmlFor="remarks">Delay Description</label>
            <textarea id="remarks" name="remarks" className="form-textarea" value={form.remarks} onChange={handleChange} placeholder="Describe the delay reason..." rows={3} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} id="delay-submit">
              {loading ? 'Submitting...' : '✅ Submit'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleClear} id="delay-clear">
              🔄 Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
