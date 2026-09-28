import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRawMaterials from './pages/admin/AdminRawMaterials';
import AdminPurchaseOrders from './pages/admin/AdminPurchaseOrders';
import AdminProduction from './pages/admin/AdminProduction';
import AdminSellers from './pages/admin/AdminSellers';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerMaterials from './pages/seller/SellerMaterials';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerProfile from './pages/seller/SellerProfile';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="state-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <div className="state-desc">Loading TexFlow Platform...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/seller/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/raw-materials" element={<AdminRawMaterials />} />
        <Route path="/admin/purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="/admin/production" element={<AdminProduction />} />
        <Route path="/admin/sellers" element={<AdminSellers />} />
      </Route>

      {/* Seller Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/materials" element={<SellerMaterials />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
