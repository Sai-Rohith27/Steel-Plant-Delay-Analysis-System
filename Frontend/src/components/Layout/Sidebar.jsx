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
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <HiOutlineBars3 />
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">V</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">Vizag Steel</span>
              <span className="sidebar-logo-sub">Delay Tracker</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="sidebar-link-icon" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{user.emp_name?.charAt(0) || 'U'}</div>
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
        .sidebar-mobile-toggle { display: none; position: fixed; top: 16px; left: 16px; z-index: 1001; background: white; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px; font-size: 1.4rem; cursor: pointer; box-shadow: var(--shadow-sm); }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 998; backdrop-filter: blur(2px); }
        
        .sidebar {
          position: fixed; top: 0; left: 0; width: 260px; height: 100vh; background: #FFFFFF; border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 1000; transition: var(--transition);
        }
        .sidebar.collapsed { width: 72px; }
        
        .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 24px; border-bottom: 1px solid var(--border); }
        .sidebar-logo-icon { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; box-shadow: var(--shadow-sm); }
        .sidebar-logo-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; display: block; }
        .sidebar-logo-sub { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
        
        .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; transition: var(--transition); border: none; background: none; width: 100%; text-align: left; cursor: pointer; text-decoration: none;
        }
        .sidebar-link:hover { background: #F8FAFC; color: var(--text-primary); }
        .sidebar-link.active { background: #EFF6FF; color: var(--primary); font-weight: 600; }
        .sidebar-link-icon { font-size: 1.25rem; }
        
        .sidebar-footer { padding: 20px 12px; border-top: 1px solid var(--border); }
        .sidebar-user { display: flex; align-items: center; gap: 12px; padding: 8px 12px; margin-bottom: 12px; }
        .sidebar-user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #EFF6FF; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1rem; flex-shrink: 0; }
        .sidebar-user-name { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
        .sidebar-user-role { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize; }
        
        .logout-btn { color: var(--text-secondary) !important; margin-top: 4px; }
        .logout-btn:hover { background: #FEF2F2 !important; color: var(--danger) !important; }

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
