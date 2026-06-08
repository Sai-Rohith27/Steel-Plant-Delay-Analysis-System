import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const ROLES = ['sys_admin', 'dept_admin', 'dept_user', 'ppm_admin', 'ppm_user'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ emp_number: '', emp_name: '', password: '', department: '', designation: '', role: 'dept_user' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async (q = '') => {
    try {
      const res = await API.get(`/users?search=${q}&limit=100`);
      setUsers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadUsers(e.target.value);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ emp_number: '', emp_name: '', password: '', department: '', designation: '', role: 'dept_user' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ emp_number: u.emp_number, emp_name: u.emp_name, password: '', department: u.department || '', designation: u.designation || '', role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await API.put(`/users/${editUser.id}`, { emp_name: form.emp_name, department: form.department, designation: form.designation, role: form.role });
        toast.success('User updated!');
      } else {
        if (!form.password) { toast.error('Password is required.'); return; }
        await API.post('/users', form);
        toast.success('User created!');
      }
      setShowModal(false);
      loadUsers(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving user.'); }
  };

  const toggleStatus = async (u) => {
    try {
      await API.patch(`/users/${u.id}/toggle-status`);
      toast.success(`User ${u.status === 'active' ? 'deactivated' : 'activated'}.`);
      loadUsers(search);
    } catch (err) { toast.error('Failed to update status.'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <Toaster position="top-right" />
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Add, modify roles, and manage user accounts</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search users..." value={search} onChange={handleSearch} style={{ paddingLeft: 36 }} id="user-search" />
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-user-btn"><HiOutlinePlus /> Add User</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Emp No</th><th>Name</th><th>Department</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.emp_number}</td>
                <td>{u.emp_name}</td>
                <td>{u.department || '-'}</td>
                <td><span className="badge badge-primary">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit"><HiOutlinePencil /></button>
                    <button className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleStatus(u)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="empty-state">No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Employee Number *</label>
                <input className="form-input" value={form.emp_number} onChange={e => setForm(p => ({ ...p, emp_number: e.target.value }))} required disabled={!!editUser} />
              </div>
              <div className="form-group">
                <label className="form-label">Employee Name *</label>
                <input className="form-input" value={form.emp_name} onChange={e => setForm(p => ({ ...p, emp_name: e.target.value }))} required />
              </div>
              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary">{editUser ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
