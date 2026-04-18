import React, { useEffect, useState } from 'react';
import API from '../api';

const typeColors = {
  reminder: '#378ADD',
  urgent:   '#EF9F27',
  warning:  '#E24B4A',
  reward:   '#1D9E75',
  penalty:  '#E24B4A',
  info:     '#9ca3af'
};

const typeLabels = {
  reminder: 'Reminder',
  urgent:   'Urgent',
  warning:  'Warning',
  reward:   '🎉 Reward',
  penalty:  'Penalty',
  info:     'Info'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then(res => {
        setNotifications(res.data.notifications);
        setUnread(res.data.unreadCount);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/mark-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-sm" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-text">No notifications yet.</div>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif._id}
              className="alert-item"
              style={{ background: notif.isRead ? 'transparent' : '#f0fdf4', borderRadius:8, padding:'12px', marginBottom:4 }}
            >
              <div className="alert-dot" style={{ background: typeColors[notif.type] || '#9ca3af', marginTop:6 }}></div>
              <div className="alert-body">
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6,
                    background: `${typeColors[notif.type]}22`,
                    color: typeColors[notif.type]
                  }}>
                    {typeLabels[notif.type] || notif.type}
                  </span>
                  {notif.form && (
                    <span style={{ fontSize:12, color:'#6b7280' }}>{notif.form.title}</span>
                  )}
                  {!notif.isRead && (
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', display:'inline-block' }}></span>
                  )}
                </div>
                <div className="alert-text">{notif.message}</div>
                <div className="alert-time">
                  {new Date(notif.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  {' · '}{notif.channel}
                  {' · '}
                  <span style={{ color: notif.status === 'sent' ? '#1D9E75' : '#E24B4A' }}>{notif.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Notifications;
