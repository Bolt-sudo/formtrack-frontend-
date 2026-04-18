import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
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

  // ── Get Mon 00:00 to Sun 23:59 of current week ───────────────
  const getThisWeekBounds = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue ... 6=Sat
    // Calculate how many days to go back to reach Monday
    const diffToMon = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMon);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getThisWeekBounds();

  const now = new Date();
  const totalForms   = forms.length;
  const activeForms  = forms.filter(f => new Date(f.deadline) > now).length;
  const overdueForms = forms.filter(f => new Date(f.deadline) < now).length;

  // All forms whose deadline falls anywhere in Mon–Sun this week
  const dueThisWeekForms = forms.filter(f => {
    const d = new Date(f.deadline);
    return d >= weekStart && d <= weekEnd;
  });
  const dueThisWeek = dueThisWeekForms.length;

  // Average submission % of this week's forms
  const dueThisWeekAvgPct = dueThisWeek
    ? Math.round(dueThisWeekForms.reduce((s, f) => s + getProgress(f), 0) / dueThisWeek)
    : 0;

  const avgRate = totalForms
    ? Math.round(forms.reduce((s, f) => s + getProgress(f), 0) / totalForms)
    : 0;

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      {alertMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1D9E75', color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 999 }}>
          {alertMsg}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Teacher dashboard</h1>
          <p className="page-subtitle">Manage forms, deadlines, and track student submissions</p>
        </div>
        <div style={{
          background: '#EEF2FF', padding: '8px 16px', borderRadius: '20px',
          fontSize: '13px', color: '#6366F1', fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {currentTime.toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short',
            year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
          })}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="metric-label">Total forms</div>
            <div className="metric-value">{totalForms}</div>
            <div className="metric-sub">{activeForms} active</div>
          </div>
          <CircularGraph percentage={totalForms > 0 ? (activeForms / totalForms) * 100 : 0} color="#6366f1" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="metric-label">Avg submission rate</div>
            <div className="metric-value">{avgRate}%</div>
            <div className="metric-sub metric-up">Across all forms</div>
          </div>
          <CircularGraph percentage={avgRate} color="#6366f1" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="metric-label">Overdue forms</div>
            <div className="metric-value" style={{ color: overdueForms > 0 ? '#E24B4A' : '#1D9E75' }}>{overdueForms}</div>
            <div className="metric-sub">Pending penalties</div>
          </div>
          <CircularGraph percentage={totalForms > 0 ? (overdueForms / totalForms) * 100 : 0} color="#E24B4A" />
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="metric-label">Due this week</div>
            <div className="metric-value">{dueThisWeek}</div>
            <div className="metric-sub">
              {formatDate(weekStart)} – {formatDate(weekEnd)}
            </div>
          </div>
          <CircularGraph percentage={dueThisWeekAvgPct} color="#EF9F27" />
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
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Deadline</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(form => {
                const pct = getProgress(form);
                const barColor = pct >= 70 ? '#1D9E75' : pct >= 40 ? '#EF9F27' : '#E24B4A';
                const deadline = new Date(form.deadline);
                const isOverdue = deadline < now;
                const isThisWeek = deadline >= weekStart && deadline <= weekEnd;
                const isFuture = deadline > now;

                let statusBadge;
                if (isThisWeek && isFuture) {
                  statusBadge = <span className="badge badge-info">Due this week</span>;
                } else if (isThisWeek && isOverdue) {
                  statusBadge = <span className="badge badge-warning">Due this week</span>;
                } else if (isFuture) {
                  statusBadge = <span className="badge badge-success">Active</span>;
                } else {
                  statusBadge = <span className="badge badge-danger">Overdue</span>;
                }

                return (
                  <tr key={form._id}>
                    <td style={{ fontWeight: 600 }}>{form.title}</td>
                    <td>{form.subject}</td>
                    <td>{deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        {form.submittedCount || 0}/{form.totalCount || 0} ({pct}%)
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                      </div>
                    </td>
                    <td>{statusBadge}</td>
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