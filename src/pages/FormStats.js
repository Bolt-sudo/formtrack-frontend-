import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const FormStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New States for Viewing Answers
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, formRes] = await Promise.all([
          API.get(`/forms/${id}/stats`),
          API.get(`/forms/${id}`)
        ]);
        setStats(statsRes.data.stats);
        setForm(formRes.data.form);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Loading stats...</div>;
  if (!stats) return <div className="loading">Form not found.</div>;

  const submissionRate = stats.total ? Math.round(((stats.submitted + stats.late) / stats.total) * 100) : 0;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{form?.title}</h1>
          <p className="page-subtitle">{form?.subject} · Deadline: {new Date(form?.deadline).toLocaleString('en-IN')}</p>
        </div>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-label">Submission Rate</div>
          <div className="stat-value">{submissionRate}%</div>
          <div className="progress" style={{ marginTop: 10 }}><div className="progress-fill" style={{ width: `${submissionRate}%`, background: '#10b981' }}></div></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Assigned</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Time</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.submitted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Late</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.late}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Submissions</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Status</th>
                <th>Submitted at</th>
                <th>Marks</th>
                <th>Actions</th> {/* New Column */}
              </tr>
            </thead>
            <tbody>
              {stats.submissions.map(sub => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>{sub.student?.name}</td>
                  <td style={{ color: '#6b7280' }}>{sub.student?.rollNumber || '—'}</td>
                  <td>
                    {sub.status === 'submitted' && <span className="badge badge-success">On time</span>}
                    {sub.status === 'late' && <span className="badge badge-warning">Late</span>}
                    {sub.status === 'missed' && <span className="badge badge-danger">Missed</span>}
                    {sub.status === 'pending' && <span className="badge badge-gray">Pending</span>}
                  </td>
                  <td style={{ color: '#6b7280' }}>
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-IN') : '—'}
                  </td>
                  <td>
                    {sub.marksApplied > 0 && <span className="marks-positive">+{sub.marksApplied}</span>}
                    {sub.marksApplied < 0 && <span className="marks-negative">{sub.marksApplied}</span>}
                    {sub.marksApplied === 0 && <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>
                    {sub.googleFormResponses ? (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setShowModal(true);
                        }}
                      >
                        View Answers
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Response Modal --- */}
      {showModal && selectedSubmission && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                Answers: {selectedSubmission.student?.name}
              </h2>
              <button style={modalStyles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div style={modalStyles.body}>
              {Object.entries(selectedSubmission.googleFormResponses).map(([question, answer]) => (
                <div key={question} style={modalStyles.item}>
                  <div style={modalStyles.question}>{question}</div>
                  <div style={modalStyles.answer}>{answer || "No response provided"}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
               <button className="btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Inline Styles for the Modal
const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
    width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af'
  },
  body: { display: 'flex', flexDirection: 'column', gap: '16px' },
  item: { borderLeft: '4px solid #6366f1', paddingLeft: '12px', background: '#f9fafb', padding: '10px', borderRadius: '4px' },
  question: { fontWeight: '700', color: '#374151', fontSize: '14px', marginBottom: '4px' },
  answer: { color: '#4b5563', fontSize: '15px' }
};

export default FormStats;