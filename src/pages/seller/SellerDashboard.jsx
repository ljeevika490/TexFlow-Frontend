import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { ShoppingBag, Clock, CheckCircle, Truck, AlertCircle, ArrowRight, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/seller-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load seller dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout title="Supplier Portal Dashboard">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p className="state-desc">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* 4 Stats Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders}
              icon={ShoppingBag}
              color="#2563eb"
              bgLight="#eff6ff"
            />
            <StatCard
              title="Pending Orders"
              value={stats?.pendingOrders}
              icon={Clock}
              color="#d97706"
              bgLight="#fef3c7"
            />
            <StatCard
              title="Confirmed Orders"
              value={stats?.confirmedOrders}
              icon={Truck}
              color="#0d9488"
              bgLight="#ccfbf1"
            />
            <StatCard
              title="Completed Orders"
              value={stats?.completedOrders}
              icon={CheckCircle}
              color="#16a34a"
              bgLight="#dcfce7"
            />
          </div>

          {/* Quick Actions & Recent Orders */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">My Recent Purchase Orders</h3>
                <Link to="/seller/orders" className="btn btn-secondary btn-sm">
                  View All Orders
                </Link>
              </div>
              <div className="table-responsive">
                {recentOrders.length === 0 ? (
                  <div className="state-container">
                    <p className="state-title">No orders placed yet</p>
                    <p className="state-desc">You haven't submitted any purchase orders.</p>
                    <Link to="/seller/materials" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                      Browse Materials & Place Order
                    </Link>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Total Value</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{order.poNumber}</td>
                          <td>{order.material?.materialName || 'N/A'}</td>
                          <td>
                            {order.quantity} {order.unit}
                          </td>
                          <td style={{ fontWeight: '600' }}>
                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td>
                            <Link
                              to={`/seller/orders/${order._id}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Boxes size={20} color="#0d9488" />
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Textile Raw Materials</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                    Explore available cotton, polyester, yarns, and dyes in the factory catalog.
                  </p>
                  <Link to="/seller/materials" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Explore Materials <ArrowRight size={14} />
                  </Link>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <ShoppingBag size={20} color="#2563eb" />
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Purchase Orders</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                    Monitor fulfillment progress and dispatch updates for your current supply contracts.
                  </p>
                  <Link to="/seller/orders" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Manage My Orders <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default SellerDashboard;
