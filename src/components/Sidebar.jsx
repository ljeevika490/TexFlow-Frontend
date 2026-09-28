import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Factory,
  Users,
  User,
  LogOut,
  Layers,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Layers size={22} />
        </div>
        <div>
          <div className="brand-title">TexFlow</div>
          <div className="brand-subtitle">Textile Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/raw-materials"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Boxes size={18} />
              <span>Raw Materials</span>
            </NavLink>
            <NavLink
              to="/admin/purchase-orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <ShoppingBag size={18} />
              <span>Purchase Orders</span>
            </NavLink>
            <NavLink
              to="/admin/production"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Factory size={18} />
              <span>Production</span>
            </NavLink>
            <NavLink
              to="/admin/sellers"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Users size={18} />
              <span>Sellers</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/seller/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/seller/materials"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Boxes size={18} />
              <span>Materials</span>
            </NavLink>
            <NavLink
              to="/seller/orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </NavLink>
            <NavLink
              to="/seller/profile"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge" style={{ marginBottom: '12px' }}>
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role-tag">{user?.role}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
