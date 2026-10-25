import { useState } from 'react';
import { Search, Bell, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ activeLabel, search, setSearch, onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'LL';

  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Toggle menu" onClick={onMenuClick}>
        <Menu />
      </button>
      <div className="breadcrumb">
        Workspace <ChevronRight size={15} /> <strong>{activeLabel}</strong>
      </div>
      <div className="top-actions">
        <div className="searchbox">
          <Search size={17} />
          <input
            aria-label="Search products"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </div>
        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} /><i />
        </button>
        <div className="avatar top-avatar">{initials}</div>
      </div>
    </header>
  );
}
