import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Login() {
  const [empNumber, setEmpNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!empNumber || !password) return setError('Please enter your credentials.');
    setLoading(true);
    try {
      await login(empNumber, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container animate-in">
        <div className="login-logo-wrap">
          <div className="login-logo"><HiOutlineBuildingOffice2 /></div>
        </div>
        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to Vizag Steel Delay Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="empNumber">Employee Number</label>
            <input
              id="empNumber"
              className="form-input"
              type="text"
              placeholder="e.g. ADMIN001"
              value={empNumber}
              onChange={e => setEmpNumber(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          padding: 20px;
        }
        .login-container {
          width: 100%;
          max-width: 400px;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          border: 1px solid #E2E8F0;
        }
        .login-logo-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
        .login-logo {
          width: 48px; height: 48px;
          background: #EFF6FF;
          color: #2563EB;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
        }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-header h1 { font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
        .login-header p { color: #64748B; font-size: 0.9rem; }
        .login-error {
          background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 8px; font-size: 0.875rem; margin-bottom: 20px; text-align: center; border: 1px solid #FECACA;
        }
      `}</style>
    </div>
  );
}
