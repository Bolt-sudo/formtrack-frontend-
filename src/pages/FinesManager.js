import React, { useEffect, useState } from 'react';
import API from '../api';

const FinesManager = () => {
  const [fines, setFines]       = useState([]);
  const [summary, setSummary]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [toast, setToast]       = useState('');
  const [waiverModal, setWaiverModal] = useState(null); // fine object
  const [waiverReason, setWaiverReason] = useState('');

  const fetchFines = async (status = '') => {
    setLoading(true);
    try {
      const res = await API.get('/fines' + (status ? `?status=${status}` : ''));
      setFines(res.data.fines);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(filter); }, [filter]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const markPaid = async (fineId) => {
    try {
      await API.patch(`/fines/${fineId}/pay`);
      showToast('Fine marked as paid.');
      fetchFines(filter);
    } catch (err) {
      showToast('Failed to update fine.');
    }
  };

  const waiveFine = async () => {
    if (!waiverReason.trim()) return;
    try {
      await API.patch(`/fines/${waiverModal._id}/waive`, { reason: waiverReason });
      showToast('Fine waived successfully.');
      setWaiverModal(null);
      setWaiverReason('');
      fetchFines(filter);
    } catch (err) {
      showToast('Failed to waive fine.');
    }
  };

  const statusBadge = (status) => {
    if (status === 'paid')   return <span className="badge badge-success">Paid</span>;
    if (status === 'waived') return <span className="badge badge-info">Waived</span>;
    return <span className="badge badge-danger">Pending</span>;
  };

  return (
    <>
      {toast && (
        <div style={{
          position:'fixed', top:20, right:20, background:'#1D9E75', color:'#fff',
          padding:'12px 20px', borderRadius:10, zIndex:999, fontSize:14, fontWeight:500
        }}>
          {toast}
        </div>
      )}

      {/* Waiver modal */}
      {waiverModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, width:420, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom:8, fontSize:17 }}>Waive fine</h3>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
              Waiving ₹{waiverModal.fineAmount} fine for <strong>{waiverModal.student?.name}</strong> on "{waiverModal.form?.title}"
            </p>
            <div className="form-group">
              <label className="form-label">Reason for waiver *</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Medical emergency, technical issue..."
                value={waiverReason}
                onChange={e => setWaiverReason(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => { setWaiverModal(null); setWaiverReason(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={waiveFine} disabled={!waiverReason.trim()}>Confirm waiver</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Fines Manager</h1>
        <p className="page-subtitle">Review, pay, and waive student fines</p>
      </div>

      <div className="metrics-grid">
        {[
          { label:'Total fines', value: summary.total || 0, sub: 'All time' },
          { label:'Pending', value: summary.pending || 0, color:'#E24B4A', sub: `₹${summary.pendingAmount || 0} due` },
          { label:'Paid', value: summary.paid || 0, color:'#1D9E75', sub: `₹${(summary.totalAmount || 0) - (summary.pendingAmount || 0)} collected` },
          { label:'Waived', value: summary.waived || 0, color:'#378ADD', sub: 'By teachers' },
        ].map((m, i) => (
          <div className="metric-card" key={i}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={m.color ? { color: m.color } : {}}>{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All fines</span>
          <div style={{ display:'flex', gap:8 }}>
            {['', 'pending', 'paid', 'waived'].map(s => (
              <button
                key={s}
                className={`btn btn-sm${filter === s ? ' btn-primary' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:20, textAlign:'center', color:'#9ca3af' }}>Loading...</div>
        ) : fines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No fines found.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Form</th>
                  <th>Type</th>
                  <th>Days Late</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(fine => (
                  <tr key={fine._id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{fine.student?.name}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>{fine.student?.rollNumber || fine.student?.email}</div>
                    </td>
                    <td style={{ maxWidth:160 }}>
                      <div style={{ fontWeight:500 }}>{fine.form?.title}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>{fine.form?.subject}</div>
                    </td>
                    <td>
                      {fine.fineType === 'missed'
                        ? <span className="badge badge-danger">Missed</span>
                        : <span className="badge badge-warning">Late</span>
                      }
                    </td>
                    <td style={{ color:'#6b7280' }}>
                      {fine.fineType === 'missed' ? '—' : `${fine.daysLate}d`}
                    </td>
                    <td style={{ fontWeight:700, color: fine.status === 'pending' ? '#E24B4A' : '#6b7280' }}>
                      ₹{fine.fineAmount}
                    </td>
                    <td>{statusBadge(fine.status)}</td>
                    <td style={{ fontSize:12, color:'#6b7280' }}>
                      {new Date(fine.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </td>
                    <td>
                      {fine.status === 'pending' && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => markPaid(fine._id)}>
                            Mark paid
                          </button>
                          <button className="btn btn-sm" onClick={() => setWaiverModal(fine)}>
                            Waive
                          </button>
                        </div>
                      )}
                      {fine.status !== 'pending' && (
                        <span style={{ fontSize:12, color:'#9ca3af' }}>
                          {fine.status === 'paid' ? `Paid ${fine.paidAt ? new Date(fine.paidAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : ''}` : `Waived`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default FinesManager;
