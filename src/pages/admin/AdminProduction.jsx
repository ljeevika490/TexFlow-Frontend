import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, AlertCircle, Check } from 'lucide-react';

const AdminProduction = () => {
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const initialFormData = {
    batchNumber: '',
    productName: '',
    fabricType: '',
    quantity: '',
    unit: 'meters',
    rawMaterial: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'PLANNED',
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchBatchesAndMaterials = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
      const qs = query.length ? `?${query.join('&')}` : '';

      const [batchRes, matRes] = await Promise.all([
        api.get(`/production${qs}`),
        api.get('/raw-materials'),
      ]);

      if (batchRes.data.success) {
        setBatches(batchRes.data.batches);
      }
      if (matRes.data.success) {
        setMaterials(matRes.data.materials);
        if (!formData.rawMaterial && matRes.data.materials.length > 0) {
          setFormData((prev) => ({ ...prev, rawMaterial: matRes.data.materials[0]._id }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load production batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesAndMaterials();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setSelectedBatch(null);
    setFormData({
      ...initialFormData,
      rawMaterial: materials.length > 0 ? materials[0]._id : '',
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      batchNumber: batch.batchNumber,
      productName: batch.productName,
      fabricType: batch.fabricType,
      quantity: batch.quantity,
      unit: batch.unit,
      rawMaterial: batch.rawMaterial?._id || '',
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
      expectedEndDate: batch.expectedEndDate
        ? new Date(batch.expectedEndDate).toISOString().split('T')[0]
        : '',
      status: batch.status,
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenDelete = (batch) => {
    setSelectedBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (selectedBatch) {
        const res = await api.put(`/production/${selectedBatch._id}`, formData);
        setSuccess(res.data.message || 'Production batch updated');
      } else {
        const res = await api.post('/production', formData);
        setSuccess(res.data.message || 'Production batch scheduled');
      }
      setIsModalOpen(false);
      fetchBatchesAndMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save production batch');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/production/${selectedBatch._id}`);
      setSuccess('Production batch deleted');
      setIsDeleteModalOpen(false);
      fetchBatchesAndMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <Layout title="Textile Production Batches">
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
            placeholder="Search by batch number or product..."
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
            <option value="PLANNED">PLANNED</option>
            <option value="IN PRODUCTION">IN PRODUCTION</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ON HOLD">ON HOLD</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>New Production Batch</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading production batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No batches found</p>
              <p className="state-desc">Create a new batch to track textile manufacturing.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Product Name</th>
                  <th>Fabric Type</th>
                  <th>Quantity</th>
                  <th>Raw Material Used</th>
                  <th>Start Date</th>
                  <th>Expected End</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch._id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{batch.batchNumber}</td>
                    <td>{batch.productName}</td>
                    <td>{batch.fabricType}</td>
                    <td>
                      {batch.quantity} {batch.unit}
                    </td>
                    <td>{batch.rawMaterial?.materialName || 'Unassigned'}</td>
                    <td>{new Date(batch.startDate).toLocaleDateString()}</td>
                    <td>{new Date(batch.expectedEndDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={batch.status} />
                    </td>
                    <td>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title="Edit Batch"
                          onClick={() => handleOpenEdit(batch)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete Batch"
                          onClick={() => handleOpenDelete(batch)}
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

      {/* Add / Edit Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBatch ? 'Edit Production Batch' : 'Create Production Batch'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Single Jersey Cotton T-Shirts"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fabric Type</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Single Jersey 180 GSM"
                value={formData.fabricType}
                onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Raw Material Allocation</label>
              <select
                className="form-select"
                required
                value={formData.rawMaterial}
                onChange={(e) => setFormData({ ...formData, rawMaterial: e.target.value })}
              >
                <option value="">Select Raw Material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.materialName} ({m.quantity} {m.unit} in stock)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Production Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                placeholder="1000"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="pieces">pieces</option>
                <option value="meters">meters</option>
                <option value="rolls">rolls</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected End Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.expectedEndDate}
                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PLANNED">PLANNED</option>
              <option value="IN PRODUCTION">IN PRODUCTION</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON HOLD">ON HOLD</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedBatch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Batch"
        maxWidth="440px"
      >
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete production batch <strong>{selectedBatch?.batchNumber}</strong>?
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

export default AdminProduction;
