import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/seller/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/seller/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>TexFlow</span>
          </div>
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Textile Production Management Platform</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@texflow.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-title">
            <KeyRound size={14} /> Quick Demo Access (1-Click Fill):
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('admin@texflow.com', 'admin123')}
            >
              <span><strong>Admin Manager</strong> (Enterprise Admin)</span>
              <span className="badge badge-in-production">Fill</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('tiruppur.tex@gmail.com', 'seller123')}
            >
              <span><strong>Tiruppur Cotton Mills</strong> (Supplier)</span>
              <span className="badge badge-available">Fill</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoFill('coimbatore.yarns@gmail.com', 'seller123')}
            >
              <span><strong>Coimbatore Spinners</strong> (Supplier)</span>
              <span className="badge badge-available">Fill</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0d9488', fontWeight: '600' }}>
            Register as Supplier
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
