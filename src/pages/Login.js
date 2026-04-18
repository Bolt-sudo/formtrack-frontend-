import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'student' ? '/student' : '/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-dot" style={{ width:12, height:12, background:'#1D9E75', borderRadius:'50%' }}></div>
          FormTrack
        </div>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              name="email" type="email" className="form-input"
              placeholder="you@college.edu"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password" type="password" className="form-input"
              placeholder="Enter your password"
              value={form.password} onChange={handleChange} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
