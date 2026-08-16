import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Production Orders' },
  { to: '/machines', label: 'Machine Monitoring' },
  { to: '/downtime', label: 'Downtime' },
  { to: '/quality', label: 'Quality' },
  { to: '/master-data', label: 'Master Data', adminOnly: true },
  { to: '/reports', label: 'Reports' }
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleLinks = links.filter((l) => !l.adminOnly || ['admin', 'supervisor'].includes(user?.role));

  return (
    <div className="app-shell">
      <header className="topnav glass">
        <NavLink to="/" className="brand">MES Control</NavLink>
        <nav className="nav-links">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-right">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="role-chip">{user?.role}</span>
          <span className="user-chip">{user?.name}</span>
          <button className="secondary logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
};

export default Layout;
