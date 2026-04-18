import React, { useEffect, useState } from 'react';
import API from '../api';

const MyFines = () => {
  const [fines, setFines]           = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    API.get('/fines/my')
      .then(res => {
        setFines(res.data.fines);
        setPendingTotal(res.data.pendingTotal);
      })
      .finally(() => setLoading(false));
  }, []);

  const paid    = fines.filter(f => f.status === 'paid');
  const waived  = fines.filter(f => f.status === 'waived');
  const pending = fines.filter(f => f.status === 'pending');

  const statusBadge = (status) => {
    if (status === 'paid')   return <span className="badge badge-success">Paid</span>;
    if (status === 'waived') return <span className="badge badge-info">Waived</span>;
    return <span className="badge badge-danger">Pending</span>;
  };

  if (loading) return <div className="loading">Loading fines...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Fines</h1>
        <p className="page-subtitle">Fines imposed for late or missed submissions</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Pending amount</div>
          <div className="metric-value" style={{ color: pendingTotal > 0 ? '#E24B4A' : '#1D9E75' }}>
            ₹{pendingTotal}
          </div>
          <div className="metric-sub">Clear at the office</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending fines</div>
          <div className="metric-value" style={{ color: pending.length > 0 ? '#E24B4A' : '#1D9E75' }}>
            {pending.length}
          </div>
          <div className="metric-sub">Unpaid</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Paid</div>
          <div className="metric-value">{paid.length}</div>
          <div className="metric-sub">Cleared</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Waived</div>
          <div className="metric-value">{waived.length}</div>
          <div className="metric-sub">By teacher</div>
        </div>
      </div>

      {pendingTotal > 0 && (
        <div style={{
          background:'#fff5f5', border:'1px solid #fecaca', borderRadius:12,
          padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:12
        }}>
          <span style={{ fontSize:20 }}>💸</span>
          <div>
            <div style={{ fontWeight:600, color:'#991b1b', fontSize:14 }}>
              You have ₹{pendingTotal} in pending fines
            </div>
            <div style={{ fontSize:13, color:'#b91c1c', marginTop:2 }}>
              Please visit the department office or contact your teacher to clear your dues.
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title" style={{ marginBottom:16 }}>All fines</div>
        {fines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No fines! Keep submitting on time.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Form</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Days Late</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(fine => (
                  <tr key={fine._id}>
                    <td style={{ fontWeight:600 }}>{fine.form?.title}</td>
                    <td style={{ color:'#6b7280' }}>{fine.form?.subject}</td>
                    <td>
                      {fine.fineType === 'missed'
                        ? <span className="badge badge-danger">Missed</span>
                        : <span className="badge badge-warning">Late</span>
                      }
                    </td>
                    <td style={{ color:'#6b7280' }}>
                      {fine.fineType === 'missed' ? '—' : `${fine.daysLate} day(s)`}
                    </td>
                    <td style={{ fontWeight:700, color: fine.status === 'pending' ? '#E24B4A' : '#6b7280' }}>
                      ₹{fine.fineAmount}
                    </td>
                    <td>{statusBadge(fine.status)}</td>
                    <td style={{ color:'#6b7280', fontSize:13 }}>
                      {new Date(fine.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
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

export default MyFines;
