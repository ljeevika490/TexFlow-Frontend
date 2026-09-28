import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search, Eye, Trash2, AlertCircle, Check } from 'lucide-react';

const AdminPurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
      const qs = query.length ? `?${query.join('&')}` : '';

      const res = await api.get(`/purchase-orders${qs}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/purchase-orders/${orderId}`, { status: newStatus });
      if (res.data.success) {
        setSuccess(`Order ${res.data.order.poNumber} status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/purchase-orders/${selectedOrder._id}`);
      setSuccess('Purchase order deleted successfully');
      setIsDeleteModalOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <Layout title="Purchase Orders Management">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="table-toolbar">
        <div className="search-input-group">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by PO number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="IN TRANSIT">IN TRANSIT</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No purchase orders found</p>
              <p className="state-desc">No orders match your filter criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier (Seller)</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Change Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{order.poNumber}</td>
                    <td>
                      <div>{order.seller?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{order.seller?.email}</div>
                    </td>
                    <td>
                      <div>{order.material?.materialName || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {order.material?.materialCode}
                      </div>
                    </td>
                    <td>
                      {order.quantity} {order.unit}
                    </td>
                    <td>₹{order.price?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN TRANSIT">IN TRANSIT</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => handleOpenDetail(order)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete Order"
                          onClick={() => handleOpenDelete(order)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Purchase Order Details - ${selectedOrder?.poNumber}`}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>PO Number:</span>
              <strong>{selectedOrder.poNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Supplier / Seller:</span>
              <strong>{selectedOrder.seller?.name} ({selectedOrder.seller?.phone || 'No phone'})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Raw Material:</span>
              <strong>{selectedOrder.material?.materialName} ({selectedOrder.material?.materialCode})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Quantity & Unit:</span>
              <span>{selectedOrder.quantity} {selectedOrder.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Unit Price:</span>
              <span>₹{selectedOrder.price?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Total PO Value:</span>
              <strong style={{ fontSize: '16px', color: '#0d9488' }}>
                ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Order Date:</span>
              <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Expected Delivery:</span>
              <span>
                {selectedOrder.expectedDate
                  ? new Date(selectedOrder.expectedDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b' }}>Current Status:</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            {selectedOrder.notes && (
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                  Supplier Notes:
                </span>
                <p style={{ margin: 0, color: '#334155' }}>{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Purchase Order"
        maxWidth="440px"
      >
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete purchase order <strong>{selectedOrder?.poNumber}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteSubmit}
          >
            Delete
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminPurchaseOrders;
