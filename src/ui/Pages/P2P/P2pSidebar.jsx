import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './p2p.css';

const P2pSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/p2p-dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
    },
    {
      path: '/p2p-create-post',
      label: 'Add post',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      path: '/p2p-my-ads',
      label: 'My Ads',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      path: '/p2p-orders',
      label: 'P2P Orders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
    },
    // {
    //   path: '/p2p-profile',
    //   hash: '#payment-methods',
    //   label: 'Payment Method',
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //       <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    //       <line x1="1" y1="10" x2="23" y2="10"/>
    //     </svg>
    //   ),
    // },
    {
      path: '/p2p-profile',
      label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const isActive = (path, hash) => {
    if (hash) {
      return location.pathname === path && location.hash === hash;
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`p2p-sidebar-overlay ${isOpen ? 'p2p-visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`p2p-sidebar ${isOpen ? 'p2p-open' : ''}`}>
        <button className="p2p-sidebar-close" onClick={onClose}>
          ×
        </button>



        <nav className="p2p-sidebar-nav mt-5">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.hash ? `${item.path}${item.hash}` : item.path}
              className={({ isActive: active }) =>
                `p2p-nav-item ${active || isActive(item.path, item.hash) ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="p2p-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p2p-sidebar-footer">
          <a href="/" className="p2p-back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Exchange</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default P2pSidebar;
