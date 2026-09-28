import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, AlertCircle, Check } from 'lucide-react';

const AdminRawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const initialFormData = {
    materialCode: '',
    materialName: '',
    category: 'Cotton',
    supplier: '',
    quantity: '',
    unit: 'kg',
    price: '',
    status: 'AVAILABLE',
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
      const qs = query.length ? `?${query.join('&')}` : '';

      const res = await api.get(`/raw-materials${qs}`);
      if (res.data.success) {
        setMaterials(res.data.materials);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setSelectedMaterial(null);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mat) => {
    setSelectedMaterial(mat);
    setFormData({
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      category: mat.category,
      supplier: mat.supplier,
      quantity: mat.quantity,
      unit: mat.unit,
      price: mat.price,
      status: mat.status,
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (mat) => {
    setSelectedMaterial(mat);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (selectedMaterial) {
        // Update
        const res = await api.put(`/raw-materials/${selectedMaterial._id}`, formData);
        setSuccess(res.data.message || 'Material updated successfully');
      } else {
        // Create
        const res = await api.post('/raw-materials', formData);
        setSuccess(res.data.message || 'Material added successfully');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save material');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/raw-materials/${selectedMaterial._id}`);
      setSuccess('Material deleted successfully');
      setIsDeleteModalOpen(false);
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <Layout title="Raw Material Inventory">
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
            placeholder="Search by code, material, supplier..."
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
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="LOW STOCK">LOW STOCK</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>

          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Add Raw Material</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No raw materials found</p>
              <p className="state-desc">Try clearing your filters or add a new material.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
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
                    <td>₹{mat.price?.toLocaleString('en-IN')} / {mat.unit}</td>
                    <td>
                      <StatusBadge status={mat.status} />
                    </td>
                    <td>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          title="Edit Material"
                          onClick={() => handleOpenEditModal(mat)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete Material"
                          onClick={() => handleOpenDeleteModal(mat)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Material Code</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. MAT-COT-10"
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Cotton">Cotton</option>
                <option value="Polyester">Polyester</option>
                <option value="Yarn">Yarn</option>
                <option value="Dye">Dye</option>
                <option value="Fabric">Fabric</option>
                <option value="Silk">Silk</option>
                <option value="Wool">Wool</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Material Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Combed Cotton 40s"
              value={formData.materialName}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supplier Name / Source</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Tiruppur Cotton Mills"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                placeholder="0"
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
                <option value="kg">kg</option>
                <option value="meters">meters</option>
                <option value="rolls">rolls</option>
                <option value="liters">liters</option>
                <option value="bales">bales</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                required
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="LOW STOCK">LOW STOCK</option>
              <option value="OUT OF STOCK">OUT OF STOCK</option>
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
              {selectedMaterial ? 'Update Material' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Material Deletion"
        maxWidth="440px"
      >
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete material{' '}
          <strong>{selectedMaterial?.materialName} ({selectedMaterial?.materialCode})</strong>? This
          action cannot be undone.
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
            Delete Permanently
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminRawMaterials;
