import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    rollNumber: '', phone: '', department: '', year: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'student' ? '/student' : '/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="logo-dot" style={{ width:12, height:12, background:'#1D9E75', borderRadius:'50%' }}></div>
          FormTrack
        </div>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input name="name" className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input name="email" type="email" className="form-input" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          {form.role === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Roll number</label>
                <input name="rollNumber" className="form-input" placeholder="e.g. CS2021001" value={form.rollNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select name="year" className="form-select" value={form.year} onChange={handleChange}>
                  <option value="">Select year</option>
                  <option value="1">First year</option>
                  <option value="2">Second year</option>
                  <option value="3">Third year</option>
                  <option value="4">Fourth year</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input name="department" className="form-input" placeholder="e.g. Computer Science" value={form.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (for SMS)</label>
              <input name="phone" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
