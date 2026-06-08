import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Login() {
  const [empNumber, setEmpNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!empNumber || !password) {
      setError('Please enter employee number and password.');
      return;
    }
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
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container animate-in">
        <div className="login-header">
          <div className="login-logo">
            <HiOutlineBuildingOffice2 />
          </div>
          <h1>Vizag Steel Plant</h1>
          <p>Equipment Delay Tracking System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" id="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="emp-number">Employee Number</label>
            <input
              id="emp-number"
              className="form-input"
              type="text"
              placeholder="e.g. ADMIN001"
              value={empNumber}
              onChange={e => setEmpNumber(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="login-password-wrap">
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} id="login-submit">
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>🏭 Rashtriya Ispat Nigam Limited</p>
          <p>Visakhapatnam Steel Plant</p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0a1628 0%, #0f1923 40%, #162231 100%);
        }
        .login-bg-effects { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .login-orb-1 { width: 400px; height: 400px; background: var(--primary); top: -100px; right: -100px; animation: float1 8s ease-in-out infinite; }
        .login-orb-2 { width: 300px; height: 300px; background: var(--accent); bottom: -80px; left: -80px; animation: float2 10s ease-in-out infinite; }
        .login-orb-3 { width: 200px; height: 200px; background: #6366f1; top: 50%; left: 50%; animation: float3 12s ease-in-out infinite; }
        @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        @keyframes float3 { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-40%, -60%); } }

        .login-container {
          width: 100%;
          max-width: 420px;
          background: rgba(22, 34, 49, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px;
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-logo {
          width: 64px; height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; color: #fff;
          box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
        }
        .login-header h1 {
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--accent));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .login-header p { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
        .login-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          color: var(--danger);
          font-size: 0.85rem;
          margin-bottom: 16px;
          text-align: center;
        }
        .login-password-wrap {
          position: relative;
        }
        .login-password-wrap .form-input { padding-right: 44px; }
        .login-password-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
        }
        .login-password-toggle:hover { color: var(--accent); }
        .login-options {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
          font-size: 0.82rem;
        }
        .login-remember {
          display: flex; align-items: center; gap: 6px;
          color: var(--text-secondary); cursor: pointer;
        }
        .login-remember input { accent-color: var(--accent); }
        .login-forgot { color: var(--accent); font-weight: 500; }
        .login-forgot:hover { text-decoration: underline; }
        .login-btn { width: 100%; justify-content: center; font-size: 0.95rem; padding: 14px; border-radius: 10px; }
        .login-footer {
          text-align: center; margin-top: 28px; padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .login-footer p { font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; }
      `}</style>
    </div>
  );
}
