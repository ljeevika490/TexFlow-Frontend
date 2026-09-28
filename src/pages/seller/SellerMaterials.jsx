import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search, ShoppingBag, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Order creation modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
      if (categoryFilter) query.push(`category=${encodeURIComponent(categoryFilter)}`);
      const qs = query.length ? `?${query.join('&')}` : '';

      const res = await api.get(`/raw-materials${qs}`);
      if (res.data.success) {
        setMaterials(res.data.materials);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch raw materials catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, statusFilter, categoryFilter]);

  const handleOpenOrderModal = (mat) => {
    setSelectedMaterial(mat);
    setOrderQuantity(50);
    setNotes('');
    setError('');
    setSuccess('');
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    setError('');
    setSubmittingOrder(true);

    try {
      const res = await api.post('/purchase-orders', {
        materialId: selectedMaterial._id,
        quantity: Number(orderQuantity),
        expectedDate,
        notes,
      });

      if (res.data.success) {
        setSuccess(`Purchase order ${res.data.order.poNumber} created successfully!`);
        setIsOrderModalOpen(false);
        setTimeout(() => {
          navigate('/seller/orders');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit purchase order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const calculatedTotal =
    selectedMaterial && orderQuantity ? Number(orderQuantity) * selectedMaterial.price : 0;

  return (
    <Layout title="Available Raw Materials">
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
            placeholder="Search catalog by material, code, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Cotton">Cotton</option>
            <option value="Polyester">Polyester</option>
            <option value="Yarn">Yarn</option>
            <option value="Dye">Dye</option>
            <option value="Fabric">Fabric</option>
          </select>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Availability</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="LOW STOCK">LOW STOCK</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading raw materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No materials found</p>
              <p className="state-desc">No raw materials match the selected filters.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>Factory Supplier</th>
                  <th>Available Quantity</th>
                  <th>Unit Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Order Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat._id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{mat.materialCode}</td>
                    <td>{mat.materialName}</td>
                    <td>{mat.category}</td>
                    <td>{mat.supplier}</td>
                    <td>
                      <strong>{mat.quantity}</strong> {mat.unit}
                    </td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>
                      ₹{mat.price?.toLocaleString('en-IN')} / {mat.unit}
                    </td>
                    <td>
                      <StatusBadge status={mat.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={mat.status === 'OUT OF STOCK'}
                        onClick={() => handleOpenOrderModal(mat)}
                        title={mat.status === 'OUT OF STOCK' ? 'Out of stock' : 'Create PO'}
                      >
                        <ShoppingBag size={14} />
                        <span>Order Material</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create Purchase Order"
      >
        {selectedMaterial && (
          <form onSubmit={handleOrderSubmit}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                {selectedMaterial.materialName}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Code: {selectedMaterial.materialCode} | Category: {selectedMaterial.category}
              </div>
              <div style={{ fontSize: '13px', color: '#0d9488', fontWeight: '600', marginTop: '4px' }}>
                Unit Price: ₹{selectedMaterial.price?.toLocaleString('en-IN')} per {selectedMaterial.unit}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Order Quantity ({selectedMaterial.unit})</label>
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
                <label className="form-label">Expected Delivery Date</label>
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
              <label className="form-label">Total Purchase Amount (Auto Calculated)</label>
              <input
                type="text"
                className="form-input"
                readOnly
                value={`₹${calculatedTotal.toLocaleString('en-IN')}`}
                style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Instructions (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Export grade packaging requested, dispatch to Tiruppur hub..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingOrder || !orderQuantity || orderQuantity <= 0}
              >
                {submittingOrder ? 'Submitting PO...' : 'Confirm & Place Order'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};

export default SellerMaterials;
