import { useState } from 'react';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Settings() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPwd || !newPwd) { toast.error('Fill both fields.'); return; }
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await API.put('/auth/change-password', { current_password: currentPwd, new_password: newPwd });
      toast.success('Password changed successfully!');
      setCurrentPwd(''); setNewPwd('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <Toaster position="top-right" />
      <div className="page-header"><h1>⚙️ Settings</h1><p>Manage your preferences</p></div>
      <div className="card" style={{ maxWidth: 450 }}>
        <h3 style={{ marginBottom: 20 }}>🔒 Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
