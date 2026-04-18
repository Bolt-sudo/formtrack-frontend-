import React, { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [forms, setForms]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState("");
  const [now, setNow]                 = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, subsRes] = await Promise.all([
          API.get("/forms"),
          API.get("/submissions/my"),
        ]);
        setForms(formsRes.data.forms);
        setSubmissions(subsRes.data.submissions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (formId) => {
    try {
      const res = await API.post("/submissions/" + formId);
      showToast(res.data.message);
      const [formsRes, subsRes] = await Promise.all([
        API.get("/forms"),
        API.get("/submissions/my"),
      ]);
      setForms(formsRes.data.forms);
      setSubmissions(subsRes.data.submissions);
    } catch (err) {
      showToast(err.response?.data?.message || "Submission failed.");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getSubmissionForForm = (formId) =>
    submissions.find((s) => s.form?._id === formId);

  const getDaysLeft = (deadline) =>
    Math.ceil((new Date(deadline) - now) / 86400000);

  const getDeadlinePct = (form) => {
    const start   = new Date(form.createdAt).getTime();
    const end     = new Date(form.deadline).getTime();
    const current = now.getTime();
    if (end <= start) return 100;
    return Math.min(100, Math.max(0, Math.round(((current - start) / (end - start)) * 100)));
  };

  const pendingForms   = forms.filter((f) => {
    const sub = getSubmissionForForm(f._id);
    return !sub || sub.status === "pending";
  });
  const completedCount = submissions.filter((s) => s.status !== "pending").length;
  const totalForms     = forms.length;
  const totalRewards   = submissions.filter((s) => s.marksType === "reward").reduce((sum, s) => sum + s.marksApplied, 0);
  const totalPenalties = submissions.filter((s) => s.marksType === "penalty").reduce((sum, s) => sum + Math.abs(s.marksApplied), 0);

  const liveDateStr = now.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  if (loading) return <div className="loading">Loading your assignments...</div>;

  const C = {
    bg:       "#f5f0ff",
    card:     "#ffffff",
    bd:       "#ede8fb",
    bd2:      "#ddd4f8",
    t1:       "#1e1040",
    t2:       "#6050a0",
    t3:       "#a898d0",
    acc:      "#6c47e8",
    accBg:    "#ede8fb",
    accLight: "#f5f2fe",
    pink:     "#e84778",
    pinkBg:   "#fdedf3",
    pinkBd:   "#fcd5e5",
    green:    "#1a9e5a",
    greenBg:  "#e4f8ed",
    red:      "#dc3030",
    redBg:    "#fdeaea",
    amber:    "#c97a00",
    amberBg:  "#fff4e0",
  };

  const RingCard = ({ value, outOf, unit, label, sub, color, trackColor }) => {
    const pct      = outOf ? Math.min(100, (Math.abs(value) / Math.max(outOf, 1)) * 100) : 65;
    const r        = 34;
    const circ     = 2 * Math.PI * r;
    const fillDash = (pct / 100) * circ;
    const displayNum = unit === "pts"
      ? (value >= 0 ? "+" + value : String(value))
      : String(value);

    return (
      <div style={{
        background: C.card, border: "1px solid " + C.bd,
        borderRadius: 18, padding: "20px 14px 16px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 10, textAlign: "center", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.bd2; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.bd;  e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ position: "relative", width: 84, height: 84 }}>
          <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="42" cy="42" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
            <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={fillDash + " " + (circ - fillDash)}
              strokeLinecap="round" />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", lineHeight: 1.2,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color }}>{displayNum}</span>
            {outOf && <span style={{ fontSize: 10.5, fontWeight: 600, color: C.t3 }}>of {outOf}</span>}
            {unit && !outOf && <span style={{ fontSize: 10.5, fontWeight: 600, color: C.t3 }}>{unit}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{label}</div>
          {sub && <div style={{ fontSize: 11, fontWeight: 500, color: C.t2, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    );
  };

  return (
    <>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20,
          background: C.t1, color: "#fff",
          padding: "12px 20px", borderRadius: 10,
          zIndex: 999, fontSize: 14, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.t1, letterSpacing: "-0.5px" }}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 13.5, color: C.t2, marginTop: 3 }}>
            Pending assignments and submission history
          </p>
        </div>
        <div style={{
          textAlign: "right",
          background: C.accBg,
          border: "1px solid " + C.bd2,
          padding: "7px 15px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.acc }}>
            {liveDateStr}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.t2 }}>
            {now.toLocaleTimeString("en-IN", {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 22 }}>
        <RingCard
          value={pendingForms.length} outOf={totalForms}
          label="Pending forms" sub="Needs attention"
          color={C.pink} trackColor="#fcd5e5"
        />
        <RingCard
          value={completedCount} outOf={totalForms}
          label="Completed" sub="This semester"
          color={C.acc} trackColor={C.bd}
        />
        <RingCard
          value={totalRewards} unit="pts"
          label="Marks earned" sub="On-time bonus"
          color={C.green} trackColor={C.greenBg}
        />
        <RingCard
          value={-totalPenalties} unit="pts"
          label="Marks deducted" sub="Late / missed"
          color={C.red} trackColor={C.redBg}
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
          PENDING ASSIGNMENTS
        </div>

        {pendingForms.length === 0 ? (
          <div style={{ background: C.card, border: "1px solid " + C.bd, borderRadius: 16, padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, color: C.t2, fontWeight: 600 }}>All caught up! No pending assignments.</div>
          </div>
        ) : (
          pendingForms.map((form) => {
            const daysLeft    = getDaysLeft(form.deadline);
            const deadlinePct = getDeadlinePct(form);
            return (
              <div key={form._id} style={{
                background: C.card, border: "1px solid " + C.bd,
                borderRadius: 16, overflow: "hidden", marginBottom: 12,
              }}>
                <div style={{
                  background: C.pinkBg, borderBottom: "1px solid " + C.pinkBd,
                  padding: "10px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.pink, display: "flex", alignItems: "center", gap: 6 }}>
                    ⏰ Action required
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: C.pinkBd, color: C.pink, padding: "3px 10px", borderRadius: 20 }}>
                    {pendingForms.length} pending
                  </span>
                </div>

                <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{form.title}</div>
                    <div style={{ fontSize: 12.5, color: C.t2, marginTop: 3 }}>
                      {form.subject} · {form.teacher?.name}
                    </div>

                    <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20,
                        background: daysLeft <= 1 ? C.redBg : daysLeft <= 3 ? C.amberBg : C.accBg,
                        color:      daysLeft <= 1 ? C.red   : daysLeft <= 3 ? C.amber   : C.acc,
                      }}>
                        {daysLeft < 0
                          ? Math.abs(daysLeft) + " day(s) overdue"
                          : daysLeft === 0 ? "Due today!"
                          : daysLeft + " day(s) remaining"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, background: C.greenBg, color: C.green }}>
                        +{form.onTimeReward} marks if on time
                      </span>
                    </div>

                    <div style={{ height: 5, background: C.bd, borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: deadlinePct + "%", background: C.pink, borderRadius: 4, transition: "width 1.4s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 5, fontWeight: 500 }}>
                      {deadlinePct}% of deadline elapsed
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                    {form.formLink && (
                      <a href={form.formLink} target="_blank" rel="noreferrer" style={{
                        fontSize: 12.5, fontWeight: 700, padding: "9px 16px",
                        border: "1.5px solid " + C.bd2, color: C.acc, background: "transparent",
                        borderRadius: 10, cursor: "pointer", textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                        Open form ↗
                      </a>
                    )}
                    {form.googleFormId ? (
                      <div style={{
                        fontSize: 12.5, fontWeight: 700, padding: "9px 16px",
                        background: C.greenBg, color: C.green,
                        border: "1.5px solid " + C.green,
                        borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                        ✅ Auto-tracked
                      </div>
                    ) : (
                      <button onClick={() => handleSubmit(form._id)} style={{
                        fontSize: 12.5, fontWeight: 700, padding: "9px 16px",
                        background: C.acc, color: "#fff", border: "none",
                        borderRadius: 10, cursor: "pointer",
                      }}>
                        Mark submitted
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <div style={{ background: C.card, border: "1px solid " + C.bd, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Submission history</h3>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.acc, cursor: "pointer" }}>View all →</span>
          </div>
          {submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.t3, fontSize: 13 }}>No submissions yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["FORM", "SUBJECT", "DATE", "STATUS", "MARKS"].map((h) => (
                    <th key={h} style={{
                      fontSize: 10.5, fontWeight: 700, color: C.t3,
                      textAlign: "left", padding: "0 0 10px",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                      borderBottom: "1px solid " + C.bd,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} style={{ cursor: "pointer" }}
                    onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(td => td.style.background = "#faf8ff"); }}
                    onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach(td => td.style.background = ""); }}
                  >
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #f8f5ff", fontWeight: 600, color: C.t1 }}>
                      {sub.form?.title}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #f8f5ff", color: C.t2, fontWeight: 500 }}>
                      {sub.form?.subject}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #f8f5ff", color: C.t2, fontWeight: 500 }}>
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #f8f5ff" }}>
                      {sub.status === "submitted" && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.greenBg, color: C.green }}>On time</span>}
                      {sub.status === "late"      && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.amberBg, color: C.amber }}>Late</span>}
                      {sub.status === "missed"    && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.redBg, color: C.red }}>Missed</span>}
                      {sub.status === "pending"   && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.accBg, color: C.t3 }}>Pending</span>}
                    </td>
                    <td style={{ padding: "10px 0", borderBottom: "1px solid #f8f5ff", fontWeight: 700, textAlign: "right" }}>
                      {sub.marksApplied > 0 && <span style={{ color: C.green }}>+{sub.marksApplied}</span>}
                      {sub.marksApplied < 0 && <span style={{ color: C.red }}>{sub.marksApplied}</span>}
                      {sub.marksApplied === 0 && <span style={{ color: C.t3 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: C.card, border: "1px solid " + C.bd, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Upcoming deadlines</h3>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.acc, cursor: "pointer" }}>See all →</span>
          </div>
          {pendingForms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.t3, fontSize: 13 }}>No upcoming deadlines 🎉</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingForms.slice(0, 5).map((form) => {
                const d = getDaysLeft(form.deadline);
                const pillStyle = d <= 1
                  ? { background: C.redBg,   color: C.red   }
                  : d <= 3
                  ? { background: C.amberBg, color: C.amber }
                  : { background: C.greenBg, color: C.green };
                return (
                  <div key={form._id} style={{
                    background: C.bg, border: "1px solid " + C.bd,
                    borderRadius: 12, padding: "12px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.bd2; e.currentTarget.style.background = C.accLight; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.bd;  e.currentTarget.style.background = C.bg; }}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{form.title}</p>
                      <span style={{ fontSize: 11.5, color: C.t2, fontWeight: 500 }}>
                        {form.subject}{form.teacher?.name ? " · " + form.teacher.name : ""}
                      </span>
                    </div>
                    <span style={{
                      ...pillStyle,
                      fontSize: 11, fontWeight: 700,
                      padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 10,
                    }}>
                      {d < 0 ? "Overdue" : d === 0 ? "Today" : d + " days"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;