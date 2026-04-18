import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  const teacherNav = [
    { path: '/teacher',             icon: '📊', label: 'Dashboard' },
    { path: '/teacher/create-form', icon: '➕', label: 'Create form' },
    { path: '/teacher/fines',       icon: '💸', label: 'Fines' },       // ✅ NEW
    { path: '/leaderboard',         icon: '🏆', label: 'Leaderboard' }, // ✅ NEW
    { path: '/notifications',       icon: '🔔', label: 'Notifications' },
  ];

  const studentNav = [
    { path: '/student',             icon: '📋', label: 'My assignments' },
    { path: '/student/fines',       icon: '💸', label: 'My fines' },    // ✅ NEW
    { path: '/leaderboard',         icon: '🏆', label: 'Leaderboard' }, // ✅ NEW
    { path: '/notifications',       icon: '🔔', label: 'Notifications' },
  ];

  const navItems = user?.role === 'student' ? studentNav : teacherNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-dot"></div>
          FormTrack
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={isActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
};

export default Layout;