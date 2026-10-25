import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, CalendarClock, ReceiptText,
  Settings, ShieldCheck, Leaf, ArrowUpRight, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/',          label: 'Overview',    icon: LayoutDashboard },
  { to: '/products',  label: 'My products', icon: Package         },
  { to: '/deadlines', label: 'Deadlines',   icon: CalendarClock   },
  { to: '/receipts',  label: 'Receipts',    icon: ReceiptText     },
];

export default function Sidebar({ onClose, mobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'LL';

  return (
    <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><ShieldCheck size={22} /></div>
        <div>
          <strong>LifeLedger</strong>
          <span>PRODUCT CARE</span>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav onClick={onClose}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="eco-card">
          <div className="eco-icon"><Leaf size={19} /></div>
          <strong>Give products a second life</strong>
          <p>Repair, reuse, or recycle with confidence.</p>
          <NavLink to="/second-life" className="eco-link" onClick={onClose}>
            Explore guide <ArrowUpRight size={14} />
          </NavLink>
        </div>

        <button className="nav-item" onClick={() => {}}>
          <Settings size={18} /><span>Settings</span>
        </button>

        <div className="profile">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{user?.name || 'Account'}</strong>
            <span>{user?.email || ''}</span>
          </div>
          <button
            className="logout-btn"
            aria-label="Sign out"
            title="Sign out"
            onClick={handleLogout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
