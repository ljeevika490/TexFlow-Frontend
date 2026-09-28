import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="page-title">{title}</div>
      <div className="navbar-actions">
        <span className={`role-pill ${isAdmin ? 'admin' : 'seller'}`}>
          {isAdmin ? 'ADMINISTRATOR' : 'SUPPLIER / SELLER'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
            {user?.name}
          </span>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
