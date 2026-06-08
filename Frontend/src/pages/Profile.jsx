import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="animate-in">
      <div className="page-header"><h1>👤 Profile</h1><p>Your account information</p></div>
      <div className="card" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
            {user?.emp_name?.charAt(0) || 'U'}
          </div>
          <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.emp_name}</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.role?.replace('_', ' ')}</p></div>
        </div>
        {[['Employee Number', user?.emp_number], ['Department', user?.department || '-'], ['Designation', user?.designation || '-'], ['Role', user?.role]].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
