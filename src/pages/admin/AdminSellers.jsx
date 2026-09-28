import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { Search, Mail, Phone, Calendar, ShoppingBag, AlertCircle } from 'lucide-react';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/sellers');
      if (res.data.success) {
        setSellers(res.data.sellers);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sellers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  return (
    <Layout title="Registered Textile Suppliers (Sellers)">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-toolbar">
        <div className="search-input-group">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search suppliers by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="state-desc">Loading suppliers...</p>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="state-container">
              <p className="state-title">No suppliers found</p>
              <p className="state-desc">No suppliers match your search query.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Contact Details</th>
                  <th>Registered On</th>
                  <th>Total Orders Placed</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller) => (
                  <tr key={seller._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{seller.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {seller._id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Mail size={14} color="#64748b" />
                        <span>{seller.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
                        <Phone size={14} color="#64748b" />
                        <span>{seller.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#64748b" />
                        <span>{new Date(seller.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingBag size={14} color="#0d9488" />
                        <strong>{seller.orderCount} Orders</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-available">ACTIVE SUPPLIER</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminSellers;
