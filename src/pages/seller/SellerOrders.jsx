import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search, Plus, Eye, XCircle, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);

  // New Order Form state
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrdersAndMaterials = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
      const qs = query.length ? `?${query.join('&')}` : '';

      const [orderRes, matRes] = await Promise.all([
        api.get(`/purchase-orders${qs}`),
        api.get('/raw-materials'),
      ]);

      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
      }
      if (matRes.data.success) {
        setMaterials(matRes.data.materials);
        if (!selectedMaterialId && matRes.data.materials.length > 0) {
          setSelectedMaterialId(matRes.data.materials[0]._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndMaterials();
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0]._id);
    }
    setError('');
    setSuccess('');
    setIsCreateModalOpen(true);
  };

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;
    try {
      const res = await api.put(`/purchase-orders/${selectedOrderToCancel._id}`, {
        status: 'CANCELLED',
      });
      if (res.data.success) {
        setSuccess(`Order ${selectedOrderToCancel.poNumber} has been cancelled`);
        setIsCancelModalOpen(false);
        fetchOrdersAndMaterials();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
      setIsCancelModalOpen(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/purchase-orders', {
        materialId: selectedMaterialId,
        quantity: Number(orderQuantity),
        expectedDate,
        notes,
      });

      if (res.data.success) {
        setSuccess(`Order ${res.data.order.poNumber} submitted successfully!`);
        setIsCreateModalOpen(false);
        fetchOrdersAndMaterials();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const chosenMaterial = materials.find((m) => m._id === selectedMaterialId);
  const totalAmount = chosenMaterial ? Number(orderQuantity || 0) * chosenMaterial.price : 0;

  return (
    <Layout title="My Purchase Orders">
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

          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading your purchase orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No orders found</p>
              <p className="state-desc">You haven't submitted any orders matching this criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Material</th>
                  <th>Order Date</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{order.poNumber}</td>
                    <td>
                      <div>{order.material?.materialName || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {order.material?.materialCode}
                      </div>
                    </td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
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
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          to={`/seller/orders/${order._id}`}
                          className="btn-icon"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        {order.status === 'PENDING' && (
                          <button
                            className="btn-icon danger"
                            title="Cancel Order"
                            onClick={() => handleOpenCancelModal(order)}
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Purchase Order"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Select Raw Material</label>
            <select
              className="form-select"
              required
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              {materials.map((m) => (
                <option key={m._id} value={m._id} disabled={m.status === 'OUT OF STOCK'}>
                  {m.materialName} ({m.materialCode}) - ₹{m.price}/{m.unit} [{m.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Quantity {chosenMaterial ? `(${chosenMaterial.unit})` : ''}
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input
              type="text"
              className="form-input"
              readOnly
              value={`₹${totalAmount.toLocaleString('en-IN')}`}
              style={{ fontWeight: '700', fontSize: '15px', color: '#0d9488' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Delivery notes, shipment preferences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !orderQuantity || orderQuantity <= 0}
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Purchase Order"
        maxWidth="440px"
      >
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to cancel purchase order{' '}
          <strong>{selectedOrderToCancel?.poNumber}</strong>? This will notify the factory.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsCancelModalOpen(false)}
          >
            No, Keep Order
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmCancel}
          >
            Yes, Cancel Order
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default SellerOrders;
