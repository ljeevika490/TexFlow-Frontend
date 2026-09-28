import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { ArrowLeft, Calendar, FileText, Package, DollarSign, AlertCircle } from 'lucide-react';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/purchase-orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load purchase order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  return (
    <Layout title={`Order Details - ${order?.poNumber || 'Loading...'}`}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/seller/orders" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p className="state-desc">Loading order details...</p>
        </div>
      ) : !order ? (
        <div className="state-container">
          <p className="state-title">Order Not Found</p>
          <p className="state-desc">This order may not exist or you do not have permission to view it.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Main Details */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 className="card-title">Order Information</h3>
                <StatusBadge status={order.status} />
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Placed: {new Date(order.orderDate).toLocaleString()}
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                    Purchase Order Number
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {order.poNumber}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                    Delivery Status
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              {/* Material Details Table */}
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>
                Ordered Material Details
              </h4>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Item Name:</span>
                  <strong>{order.material?.materialName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Material Code:</span>
                  <span>{order.material?.materialCode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Category:</span>
                  <span>{order.material?.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Order Quantity:</span>
                  <span>{order.quantity} {order.unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Unit Price:</span>
                  <span>₹{order.price?.toLocaleString('en-IN')} / {order.unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>Total Amount:</span>
                  <strong style={{ fontSize: '18px', color: '#0d9488' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  Purchase Order Notes
                </h4>
                <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#334155', fontSize: '14px' }}>
                  {order.notes || 'No special instructions recorded for this purchase order.'}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Timeline & Info</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Expected Fulfillment Date:</span>
                <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                  {order.expectedDate
                    ? new Date(order.expectedDate).toLocaleDateString()
                    : 'Standard Dispatch (7 Days)'}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Supplier Account:</span>
                <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                  {order.seller?.name}
                </div>
                <div style={{ color: '#64748b' }}>{order.seller?.email}</div>
                <div style={{ color: '#64748b' }}>{order.seller?.phone}</div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <span style={{ color: '#64748b' }}>Order Security:</span>
                <p style={{ marginTop: '4px', color: '#475569' }}>
                  This purchase order is secured via authenticated role-based verification on TexFlow platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SellerOrderDetail;
