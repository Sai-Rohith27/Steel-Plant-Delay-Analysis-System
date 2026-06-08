import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineChartBarSquare, HiOutlineClock, HiOutlineDocumentText,
  HiOutlineChartBar, HiOutlineWrench, HiOutlineCloudArrowUp,
  HiOutlineUsers, HiOutlineUser, HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle, HiOutlineClipboardDocumentList,
  HiOutlineBars3
} from 'react-icons/hi2';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
  { path: '/delay-entry', label: 'Delay Entry', icon: HiOutlineClock },
  { path: '/delay-history', label: 'Delay History', icon: HiOutlineClipboardDocumentList },
  { path: '/reports', label: 'Reports', icon: HiOutlineDocumentText },
  { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { path: '/equipment', label: 'Equipment Master', icon: HiOutlineWrench },
  { path: '/import', label: 'Data Import', icon: HiOutlineCloudArrowUp },
  { path: '/users', label: 'User Management', icon: HiOutlineUsers, admin: true },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = navItems.filter(item => !item.admin || isAdmin());

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <HiOutlineBars3 />
      </button>

      {/* Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏭</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">VSP</span>
              <span className="sidebar-logo-sub">Delay Tracker</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : ''}
            >
              <item.icon className="sidebar-link-icon" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="sidebar-footer">
          {!collapsed && user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.emp_name?.charAt(0) || 'U'}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.emp_name}</span>
                <span className="sidebar-user-role">{user.role?.replace('_', ' ')}</span>
              </div>
            </div>
          )}
          <button className="sidebar-link logout-btn" onClick={logout}>
            <HiOutlineArrowRightOnRectangle className="sidebar-link-icon" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          top: 16px; left: 16px;
          z-index: 1001;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 8px;
          font-size: 1.4rem;
        }
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
        }
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 260px;
          height: 100vh;
          background: linear-gradient(180deg, #0d1b2a 0%, #1b2a4a 100%);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: var(--transition);
          overflow-y: auto;
        }
        .sidebar.collapsed { width: 72px; }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo-icon { font-size: 1.8rem; }
        .sidebar-logo-title {
          font-size: 1.3rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-logo-sub { display: block; font-size: 0.7rem; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
        .sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition);
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .sidebar-link:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
        .sidebar-link.active {
          background: var(--accent-glow);
          color: var(--accent);
          font-weight: 600;
        }
        .sidebar-link.active .sidebar-link-icon { color: var(--accent); }
        .sidebar-link-icon { font-size: 1.2rem; flex-shrink: 0; }
        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid var(--border);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          margin-bottom: 4px;
        }
        .sidebar-user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: #fff;
          flex-shrink: 0;
        }
        .sidebar-user-name { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
        .sidebar-user-role { display: block; font-size: 0.7rem; color: var(--text-muted); text-transform: capitalize; }
        .logout-btn { color: var(--danger) !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.1) !important; }

        @media (max-width: 1024px) {
          .sidebar-mobile-toggle { display: flex; }
          .sidebar-overlay { display: block; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.mobile-open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
