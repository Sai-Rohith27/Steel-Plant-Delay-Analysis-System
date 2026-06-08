import { useState, useEffect } from 'react';
import API from '../api/axios';
import { HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function DelayHistory() {
  const { isAdmin } = useAuth();
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadDelays(); }, [page]);

  const loadDelays = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/delays?page=${page}&limit=25&search=${search}`);
      setDelays(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); loadDelays(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delay?')) return;
    try {
      await API.delete(`/delays/${id}`);
      toast.success('Delay deleted.');
      loadDelays();
    } catch (err) { toast.error('Delete failed.'); }
  };

  return (
    <div className="animate-in">
      <Toaster position="top-right" />
      <div className="page-header">
        <h1>📋 Delay History</h1>
        <p>View and manage all recorded delay entries ({total.toLocaleString()} records)</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search delays..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ paddingLeft: 36 }} />
        </div>
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Shop</th><th>Equipment</th><th>Sub Equip</th><th>Agency</th><th>Duration</th><th>Description</th>{isAdmin() && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {delays.map(d => (
                  <tr key={d.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{d.del_date ? new Date(d.del_date).toLocaleDateString('en-IN') : '-'}</td>
                    <td><span className="badge badge-primary">{d.shop_desc?.split(' - ')[0] || d.shop_code}</span></td>
                    <td style={{ fontWeight: 500 }}>{d.equipment || '-'}</td>
                    <td>{d.sub_equipment || '-'}</td>
                    <td><span className={`badge ${d.agency_code === 'M' ? 'badge-warning' : d.agency_code === 'E' ? 'badge-danger' : d.agency_code === 'SD' ? 'badge-info' : 'badge-success'}`}>{d.agency_code}</span></td>
                    <td>{d.delay_duration}h</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.remarks}>{d.remarks || '-'}</td>
                    {isAdmin() && (
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(d.id)} title="Delete"><HiOutlineTrash style={{ color: 'var(--danger)' }} /></button>
                      </td>
                    )}
                  </tr>
                ))}
                {delays.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No delays found</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><HiOutlineChevronLeft /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
            })}
            {totalPages > 5 && <span style={{ color: 'var(--text-muted)', padding: '0 8px' }}>...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><HiOutlineChevronRight /></button>
          </div>
        </>
      )}
    </div>
  );
}
