import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Users, Boxes, ShoppingBag, Factory, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productionSummary, setProductionSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/admin-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setProductionSummary(res.data.productionSummary || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout title="Enterprise Dashboard">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p className="state-desc">Loading production overview...</p>
        </div>
      ) : (
        <>
          {/* 5 Stats Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Sellers"
              value={stats?.totalSellers}
              icon={Users}
              color="#2563eb"
              bgLight="#eff6ff"
            />
            <StatCard
              title="Raw Materials"
              value={stats?.totalRawMaterials}
              icon={Boxes}
              color="#0d9488"
              bgLight="#ccfbf1"
            />
            <StatCard
              title="Purchase Orders"
              value={stats?.totalPurchaseOrders}
              icon={ShoppingBag}
              color="#d97706"
              bgLight="#fef3c7"
            />
            <StatCard
              title="Active Production"
              value={stats?.activeProductionBatches}
              icon={Factory}
              color="#4f46e5"
              bgLight="#e0e7ff"
            />
            <StatCard
              title="Completed Batches"
              value={stats?.completedProductionBatches}
              icon={CheckCircle}
              color="#16a34a"
              bgLight="#dcfce7"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Recent Orders Table */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Purchase Orders</h3>
                <Link to="/admin/purchase-orders" className="btn btn-secondary btn-sm">
                  View All Orders
                </Link>
              </div>
              <div className="table-responsive">
                {recentOrders.length === 0 ? (
                  <div className="state-container">
                    <p className="state-desc">No purchase orders found.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Supplier</th>
                        <th>Material</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>
                            {order.poNumber}
                          </td>
                          <td>{order.seller?.name || 'N/A'}</td>
                          <td>{order.material?.materialName || 'N/A'}</td>
                          <td style={{ fontWeight: '600' }}>
                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Production Status Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Production Status</h3>
                <Link to="/admin/production" className="btn btn-secondary btn-sm">
                  Manage
                </Link>
              </div>
              <div className="card-body">
                {productionSummary.length === 0 ? (
                  <p className="state-desc">No production batches scheduled.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {productionSummary.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StatusBadge status={item._id} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                          {item.count} {item.count === 1 ? 'Batch' : 'Batches'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboard;
