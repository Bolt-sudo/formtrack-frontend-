import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// Reusable Circular Graph Component
const CircularGraph = ({ percentage, color }) => {
  const radius = 30;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
      <svg height="60" width="60">
        <circle stroke="#f3f4f6" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx="30" cy="30" />
        <circle
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.8s ease-in-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%' 
          }}
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="30"
          cy="30"
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="700" fill="#374151">
          {Math.round(percentage)}%
        </text>
      </svg>
    </div>
  );
};

const TeacherDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date()); // Added for live clock
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchForms = async () => {
    try {
      const res = await API.get('/forms');
      setForms(res.data.forms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (formId) => {
    try {
      const res = await API.post(`/forms/${formId}/send-reminder`);
      showAlert(res.data.message);
    } catch (err) {
      showAlert('Failed to send reminder.');
    }
  };

  const deleteForm = async (formId) => {
    if (!window.confirm('Delete this form?')) return;
    try {
      await API.delete(`/forms/${formId}`);
      setForms(forms.filter(f => f._id !== formId));
      showAlert('Form deleted.');
    } catch (err) {
      showAlert('Failed to delete form.');
    }
  };

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const getProgress = (form) => {
    if (!form.totalCount) return 0;
    return Math.round((form.submittedCount / form.totalCount) * 100);
  };

  const totalForms = forms.length;
  const activeForms = forms.filter(f => new Date(f.deadline) > new Date()).length;
  const overdueForms = forms.filter(f => new Date(f.deadline) < new Date()).length;
  const dueThisWeek = forms.filter(f => {
    const d = Math.ceil((new Date(f.deadline) - new Date()) / 86400000);
    return d >= 0 && d <= 7;
  }).length;
  const avgRate = totalForms ? Math.round(forms.reduce((s, f) => s + getProgress(f), 0) / totalForms) : 0;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      {alertMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1D9E75', color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 999 }}>
          {alertMsg}
        </div>
      )}

      {/* Header with Live Date and Time */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Teacher dashboard</h1>
          <p className="page-subtitle">Manage forms, deadlines, and track student submissions</p>
        </div>
        <div style={{ 
          background: '#EEF2FF', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '13px', 
          color: '#6366F1', 
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {currentTime.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div className="metric-label">Total forms</div><div className="metric-value">{totalForms}</div><div className="metric-sub">{activeForms} active</div></div>
          <CircularGraph percentage={totalForms > 0 ? (activeForms / totalForms) * 100 : 0} color="#6366f1" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div className="metric-label">Avg submission rate</div><div className="metric-value">{avgRate}%</div><div className="metric-sub metric-up">Across all forms</div></div>
          <CircularGraph percentage={avgRate} color="#6366f1" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div className="metric-label">Overdue forms</div><div className="metric-value" style={{ color: overdueForms > 0 ? '#E24B4A' : '#1D9E75' }}>{overdueForms}</div><div className="metric-sub">Pending penalties</div></div>
          <CircularGraph percentage={totalForms > 0 ? (overdueForms / totalForms) * 100 : 0} color="#E24B4A" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div className="metric-label">Due this week</div><div className="metric-value">{dueThisWeek}</div><div className="metric-sub">Upcoming deadlines</div></div>
          <CircularGraph percentage={totalForms > 0 ? (dueThisWeek / totalForms) * 100 : 0} color="#EF9F27" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All forms</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/create-form')}>➕ Create form</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Subject</th><th>Deadline</th><th>Submissions</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {forms.map(form => {
                const pct = getProgress(form);
                const barColor = pct >= 70 ? '#1D9E75' : pct >= 40 ? '#EF9F27' : '#E24B4A';
                return (
                  <tr key={form._id}>
                    <td style={{ fontWeight: 600 }}>{form.title}</td>
                    <td>{form.subject}</td>
                    <td>{new Date(form.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{form.submittedCount || 0}/{form.totalCount || 0} ({pct}%)</div>
                      <div className="progress"><div className="progress-fill" style={{ width: `${pct}%`, background: barColor }}></div></div>
                    </td>
                    <td>{new Date(form.deadline) < new Date() ? <span className="badge badge-danger">Overdue</span> : <span className="badge badge-info">Active</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" onClick={() => navigate(`/teacher/forms/${form._id}/stats`)}>Stats</button>
                        <button className="btn btn-sm btn-primary" onClick={() => sendReminder(form._id)}>Alert</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteForm(form._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;