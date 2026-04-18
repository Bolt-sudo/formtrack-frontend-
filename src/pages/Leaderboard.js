import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank]           = useState(null);
  const [weekInfo, setWeekInfo]       = useState({});
  const [loading, setLoading]         = useState(true);

  // --- Celebration Logic ---
  const triggerCelebration = () => {
    // 1. Audio logic using your uploaded file
    const audio = new Audio('/celebration.mp3'); 
    audio.volume = 0.5;
    
    // Play with a catch block for browser security
    audio.play().catch(err => {
      console.log("Sound will play after you click anywhere on the page.");
    });

    // 2. Visual logic (Rainy Confetti)
    const end = Date.now() + (4 * 1000);
    const colors = ['#1D9E75', '#F59E0B', '#E24B4A', '#3B82F6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, rankRes] = await Promise.all([
          API.get('/leaderboard/current'),
          user.role === 'student' ? API.get('/leaderboard/my-rank') : Promise.resolve(null)
        ]);
        setLeaderboard(lbRes.data.leaderboard);
        setWeekInfo({ weekStart: lbRes.data.weekStart, weekEnd: lbRes.data.weekEnd, total: lbRes.data.totalStudents });
        if (rankRes) setMyRank(rankRes.data);

        // Trigger if data exists
        if (lbRes.data.leaderboard.length > 0) {
            triggerCelebration();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  // Helper functions
  const medalColor = (rank) => {
    if (rank === 1) return '#F59E0B';
    if (rank === 2) return '#9CA3AF';
    if (rank === 3) return '#CD7C2F';
    return null;
  };

  const medalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '';

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Weekly Leaderboard 🏆</h1>
        <p className="page-subtitle">
          {weekInfo.weekStart && weekInfo.weekEnd
            ? `${fmtDate(weekInfo.weekStart)} – ${fmtDate(weekInfo.weekEnd)} · ${weekInfo.total} students ranked`
            : 'This week\'s rankings'}
        </p>
      </div>

      {/* My rank card */}
      {user.role === 'student' && myRank && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #1D9E75 100%)',
          borderRadius:14, padding:'20px 24px', marginBottom:24,
          display:'flex', alignItems:'center', gap:20, color:'#fff'
        }}>
          <div style={{ fontSize:40 }}>{medalEmoji(myRank.rank) || '🎯'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, opacity:0.75, marginBottom:4 }}>Your rank this week</div>
            <div style={{ fontSize:28, fontWeight:800, lineHeight:1 }}>
              #{myRank.rank ?? '—'}
              <span style={{ fontSize:14, fontWeight:400, opacity:0.7, marginLeft:8 }}>
                of {myRank.totalRanked}
              </span>
            </div>
            <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>{myRank.weekLabel}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:13, opacity:0.75, marginBottom:4 }}>Total points</div>
            <div style={{ fontSize:32, fontWeight:800 }}>{myRank.totalPoints ?? 0}</div>
            <div style={{ fontSize:12, opacity:0.7, marginTop:2 }}>
              ✅ {myRank.onTimeCount} on-time &nbsp;
              ⚠️ {myRank.lateCount} late &nbsp;
              ❌ {myRank.missedCount} missed
            </div>
          </div>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">No leaderboard data for this week yet.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <div style={{ display:'flex', gap:12, marginBottom:24, alignItems:'flex-end', justifyContent:'center' }}>
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                const heights = ['120px', '150px', '100px'];
                const realRank = [2, 1, 3][i];
                return (
                  <div key={entry._id} style={{
                    flex:1, maxWidth:200,
                    background:'#fff', borderRadius:14, border:'1px solid #e8ecf0',
                    padding:'20px 16px', textAlign:'center',
                    minHeight: heights[i],
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end',
                    boxShadow: realRank === 1 ? '0 4px 20px rgba(245,158,11,0.2)' : 'none',
                    borderColor: realRank === 1 ? '#F59E0B' : '#e8ecf0'
                  }}>
                    <div style={{ fontSize: realRank === 1 ? 36 : 28 }}>{medalEmoji(realRank)}</div>
                    <div style={{ fontWeight:700, fontSize:14, marginTop:8, color:'#1a1a2e' }}>
                      {entry.student?.name?.split(' ')[0]}
                    </div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{entry.student?.rollNumber || ''}</div>
                    <div style={{ fontSize:20, fontWeight:800, color: medalColor(realRank), marginTop:4 }}>
                      {entry.totalPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full rankings table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom:16 }}>Full rankings</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>On-time</th>
                    <th>Late</th>
                    <th>Missed</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(entry => {
                    const isMe = entry.isMe;
                    const medal = medalEmoji(entry.rank);
                    return (
                      <tr key={entry._id} style={{
                        background: isMe ? '#ecfdf5' : 'transparent',
                        fontWeight: isMe ? 600 : 'normal'
                      }}>
                        <td>
                          <span style={{ fontWeight:700, fontSize:15, color: medalColor(entry.rank) || '#374151' }}>
                            {medal ? `${medal}` : `#${entry.rank}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight:600 }}>
                            {entry.student?.name}
                            {isMe && <span style={{ fontSize:11, background:'#1D9E75', color:'#fff', borderRadius:6, padding:'1px 6px', marginLeft:8 }}>You</span>}
                          </div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{entry.student?.rollNumber || ''}</div>
                        </td>
                        <td><span style={{ color:'#1D9E75' }}>{entry.onTimeCount}</span></td>
                        <td><span style={{ color:'#EF9F27' }}>{entry.lateCount}</span></td>
                        <td><span style={{ color:'#E24B4A' }}>{entry.missedCount}</span></td>
                        <td><span style={{ fontWeight:700 }}>{entry.totalPoints}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Leaderboard;