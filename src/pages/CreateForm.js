import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// ── Question type options ─────────────────────────────────────
const QUESTION_TYPES = [
  { value: 'text',       label: 'Short text',       icon: '✏️' },
  { value: 'paragraph',  label: 'Paragraph',        icon: '📝' },
  { value: 'radio',      label: 'Multiple choice',  icon: '🔘' },
  { value: 'checkbox',   label: 'Checkboxes',       icon: '☑️' },
  { value: 'dropdown',   label: 'Dropdown',         icon: '🔽' },
  { value: 'scale',      label: 'Linear scale',     icon: '📊' },
  { value: 'date',       label: 'Date',             icon: '📅' },
  { value: 'time',       label: 'Time',             icon: '🕐' },
];

const CHOICE_TYPES = ['radio', 'checkbox', 'dropdown'];

// ── Empty question template ───────────────────────────────────
const newQuestion = () => ({
  id:        Date.now() + Math.random(),
  type:      'text',
  title:     '',
  required:  true,
  options:   ['', ''],
  low:       1,
  high:      5,
  lowLabel:  '',
  highLabel: '',
});

// ── Single question card ──────────────────────────────────────
const QuestionCard = ({ q, index, total, onChange, onRemove, onMove }) => {
  const isChoice = CHOICE_TYPES.includes(q.type);

  const updateField = (field, value) => onChange({ ...q, [field]: value });

  const updateOption = (i, value) => {
    const opts = [...q.options];
    opts[i] = value;
    onChange({ ...q, options: opts });
  };

  const addOption = () => onChange({ ...q, options: [...q.options, ''] });

  const removeOption = (i) => {
    if (q.options.length <= 2) return;
    onChange({ ...q, options: q.options.filter((_, idx) => idx !== i) });
  };

  return (
    <div style={{
      border: '1px solid #e8ecf0',
      borderRadius: 12,
      padding: '18px 20px',
      marginBottom: 12,
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      position: 'relative',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {/* Index badge */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#1D9E75', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* Question title input */}
        <input
          className="form-input"
          style={{ flex: 1, margin: 0 }}
          placeholder={`Question ${index + 1} title`}
          value={q.title}
          onChange={e => updateField('title', e.target.value)}
        />

        {/* Type selector */}
        <select
          className="form-select"
          style={{ width: 170, margin: 0, flexShrink: 0 }}
          value={q.type}
          onChange={e => updateField('type', e.target.value)}
        >
          {QUESTION_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>

        {/* Required toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280', flexShrink: 0, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={q.required}
            onChange={e => updateField('required', e.target.checked)}
            style={{ accentColor: '#1D9E75' }}
          />
          Required
        </label>

        {/* Move up/down */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            style={{
              width: 22, height: 22, border: '1px solid #e8ecf0', borderRadius: 4,
              background: '#f9fafb', cursor: index === 0 ? 'not-allowed' : 'pointer',
              fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: index === 0 ? 0.4 : 1,
            }}
          >▲</button>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1}
            style={{
              width: 22, height: 22, border: '1px solid #e8ecf0', borderRadius: 4,
              background: '#f9fafb', cursor: index === total - 1 ? 'not-allowed' : 'pointer',
              fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: index === total - 1 ? 0.4 : 1,
            }}
          >▼</button>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(q.id)}
          style={{
            width: 28, height: 28, border: '1px solid #fecaca', borderRadius: 6,
            background: '#fff5f5', color: '#E24B4A', cursor: 'pointer',
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >✕</button>
      </div>

      {/* Choice options */}
      {isChoice && (
        <div style={{ paddingLeft: 36 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Answer options:</div>
          {q.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 16, flexShrink: 0 }}>
                {q.type === 'checkbox' ? '☐' : q.type === 'dropdown' ? `${i+1}.` : '○'}
              </span>
              <input
                className="form-input"
                style={{ flex: 1, margin: 0, fontSize: 13, padding: '6px 10px' }}
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={q.options.length <= 2}
                style={{
                  width: 24, height: 24, border: '1px solid #e8ecf0', borderRadius: 4,
                  background: '#f9fafb', color: '#9ca3af', cursor: q.options.length <= 2 ? 'not-allowed' : 'pointer',
                  fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: q.options.length <= 2 ? 0.4 : 1,
                }}
              >✕</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            style={{
              marginTop: 4, fontSize: 12, color: '#1D9E75', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px 0', fontWeight: 500,
            }}
          >+ Add option</button>
        </div>
      )}

      {/* Scale options */}
      {q.type === 'scale' && (
        <div style={{ paddingLeft: 36, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Min:</label>
            <input type="number" className="form-input" style={{ width: 64, margin: 0, padding: '6px 10px', fontSize: 13 }}
              min={0} max={q.high - 1} value={q.low} onChange={e => updateField('low', +e.target.value)} />
            <input className="form-input" style={{ width: 120, margin: 0, padding: '6px 10px', fontSize: 13 }}
              placeholder="Low label" value={q.lowLabel} onChange={e => updateField('lowLabel', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Max:</label>
            <input type="number" className="form-input" style={{ width: 64, margin: 0, padding: '6px 10px', fontSize: 13 }}
              min={q.low + 1} max={10} value={q.high} onChange={e => updateField('high', +e.target.value)} />
            <input className="form-input" style={{ width: 120, margin: 0, padding: '6px 10px', fontSize: 13 }}
              placeholder="High label" value={q.highLabel} onChange={e => updateField('highLabel', e.target.value)} />
          </div>
        </div>
      )}

      {/* Text/Paragraph/Date/Time preview hint */}
      {['text', 'paragraph', 'date', 'time'].includes(q.type) && (
        <div style={{ paddingLeft: 36 }}>
          <div style={{
            fontSize: 12, color: '#9ca3af', fontStyle: 'italic',
            border: '1px dashed #e8ecf0', borderRadius: 6, padding: '8px 12px',
          }}>
            {q.type === 'text'      && 'Short answer text field'}
            {q.type === 'paragraph' && 'Long answer paragraph field'}
            {q.type === 'date'      && 'Date picker (MM/DD/YYYY)'}
            {q.type === 'time'      && 'Time picker (HH:MM)'}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main CreateForm component ─────────────────────────────────
const CreateForm = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', deadline: '',
    onTimeReward: 2, latePenalty: 1, missedPenalty: 2,
    reminderDays: [3, 1], assignedStudents: [], formLink: '',
  });

  const [linkMode, setLinkMode]               = useState('manual');
  const [questions, setQuestions]             = useState([newQuestion()]);
  const [autoTitle, setAutoTitle]             = useState('');
  const [autoDesc, setAutoDesc]               = useState('');
  const [students, setStudents]               = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [generating, setGenerating]           = useState(false);
  const [aiTopic, setAiTopic]                 = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiLoading, setAiLoading]             = useState(false);
  const [error, setError]                     = useState('');
  const [successUrl, setSuccessUrl]           = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    API.get('/students').then(res => setStudents(res.data.students)).catch(() => {});
  }, []);

  useEffect(() => {
    if (linkMode === 'auto' && !autoTitle && formData.title) {
      setAutoTitle(formData.title);
    }
  }, [linkMode]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = id => {
    setFormData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(id)
        ? prev.assignedStudents.filter(s => s !== id)
        : [...prev.assignedStudents, id],
    }));
  };

  const selectAll = () => {
    setFormData(prev => ({ ...prev, assignedStudents: students.map(s => s._id) }));
  };

  const addQuestion    = () => setQuestions(prev => [...prev, newQuestion()]);
  const updateQuestion = (updated) => setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
  const removeQuestion = (id) => { if (questions.length === 1) return; setQuestions(prev => prev.filter(q => q.id !== id)); };

  const generateQuestionsWithAI = async () => {
    if (!aiTopic.trim()) {
      setError('Please enter a topic for AI generation.');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const res = await API.post('/ai/generate-questions', {
        topic: aiTopic,
        subject: formData.subject,
        questionCount: aiQuestionCount,
      });

      const aiQuestions = res.data.questions.map((q, i) => ({
        id: Date.now() + i + Math.random(),
        // Groq returns 'title' field directly
        title: q.title || q.question || '',
        type: q.type === 'multiple_choice' ? 'radio' : (q.type || 'text'),
        required: true,
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', ''],
        low: 1, high: 5, lowLabel: '', highLabel: '',
      }));

      // Remove empty/blank questions first, then add AI questions
setQuestions(prev => {
  const nonEmpty = prev.filter(q => q.title.trim() !== '');
  return [...nonEmpty, ...aiQuestions];
});
      setAiTopic('');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const moveQuestion = (index, dir) => {
    const arr = [...questions];
    const swapIdx = dir === 'up' ? index - 1 : index + 1;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    setQuestions(arr);
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) return `Question ${i + 1} is missing a title.`;
      if (CHOICE_TYPES.includes(q.type)) {
        const filled = q.options.filter(o => o.trim());
        if (filled.length < 2) return `Question ${i + 1} needs at least 2 non-empty options.`;
      }
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessUrl('');

    if (!formData.title || !formData.deadline || !formData.subject) {
      setError('Please fill in title, subject, and deadline.');
      return;
    }
    if (formData.assignedStudents.length === 0) {
      setError('Please assign at least one student.');
      return;
    }
    if (linkMode === 'auto') {
      if (!autoTitle.trim()) { setError('Please enter a Google Form title.'); return; }
      const qErr = validateQuestions();
      if (qErr) { setError(qErr); return; }
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (linkMode !== 'manual') payload.formLink = '';

      const res = await API.post('/forms', payload);
      const createdForm = res.data.form;

      if (linkMode === 'auto') {
        setGenerating(true);
        try {
          const cleanQuestions = questions.map(({ id, ...rest }) => {
            const q = { ...rest };
            if (CHOICE_TYPES.includes(q.type)) {
              q.options = q.options.filter(o => o.trim());
            }
            return q;
          });

          const genRes = await API.post(`/forms/${createdForm._id}/generate-custom-form`, {
            formTitle:       autoTitle.trim(),
            formDescription: autoDesc.trim(),
            questions:       cleanQuestions,
          });

          setSuccessUrl(genRes.data.url);
          setGenerating(false);
          setLoading(false);
          setTimeout(() => navigate('/teacher'), 2500);
          return;
        } catch (genErr) {
          setGenerating(false);
          setError('FormTrack form created but Google Form generation failed: ' + (genErr.response?.data?.message || genErr.message));
          setLoading(false);
          return;
        }
      }

      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Create new form</h1>
        <p className="page-subtitle">Set up a new assignment with deadline and automated alerts</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {successUrl && (
        <div style={{
          background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12,
          padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 600, color: '#065f46', fontSize: 14 }}>
              Google Form created successfully!
            </div>
            <a href={successUrl} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: '#1D9E75', wordBreak: 'break-all' }}>
              {successUrl}
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Form details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Form title *</label>
              <input name="title" className="form-input" placeholder="e.g. Mid-semester feedback form"
                value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input name="subject" className="form-input" placeholder="e.g. Computer Science"
                value={formData.subject} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea"
              placeholder="Brief description of what students need to submit..."
              value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input name="deadline" type="datetime-local" className="form-input"
              value={formData.deadline} onChange={handleChange} required />
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Google Form link</div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Paste an existing link or let FormTrack generate one from your questions.
          </p>

          <div style={{
            display: 'inline-flex', background: '#f3f4f6', borderRadius: 10,
            padding: 4, marginBottom: 20, gap: 4,
          }}>
            {[
              { key: 'manual', label: '🔗 Paste link manually' },
              { key: 'auto',   label: '✨ Auto-generate Google Form' },
            ].map(opt => (
              <button key={opt.key} type="button" onClick={() => setLinkMode(opt.key)}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  background: linkMode === opt.key ? '#fff' : 'transparent',
                  color:      linkMode === opt.key ? '#1D9E75' : '#6b7280',
                  boxShadow:  linkMode === opt.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          {linkMode === 'manual' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Google Form / submission link</label>
              <input name="formLink" className="form-input"
                placeholder="https://forms.google.com/..."
                value={formData.formLink} onChange={handleChange} />
            </div>
          )}

          {linkMode === 'auto' && (
            <div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Google Form title *</label>
                  <input className="form-input" placeholder="e.g. Internship Status Form"
                    value={autoTitle} onChange={e => setAutoTitle(e.target.value)} />
                  <span className="form-hint">This appears as the title on the actual Google Form</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Google Form description</label>
                  <input className="form-input" placeholder="e.g. Fill in your internship details accurately"
                    value={autoDesc} onChange={e => setAutoDesc(e.target.value)} />
                  <span className="form-hint">Optional subtitle shown below the form title</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />

              {/* ── AI Question Generator ── */}
              <div style={{
                border: '2px dashed #1D9E75',
                borderRadius: 12,
                padding: '18px 20px',
                marginBottom: 20,
                background: '#f0fdf4',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>✨</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#065f46' }}>Generate questions with AI</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>AI will suggest questions — you can edit or delete them after</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, margin: 0, minWidth: 220 }}
                    placeholder="Enter topic e.g. Linked Lists, DBMS, OS Scheduling"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                  />
                  <select
                    className="form-select"
                    style={{ width: 140, margin: 0 }}
                    value={aiQuestionCount}
                    onChange={e => setAiQuestionCount(Number(e.target.value))}
                  >
                    <option value={3}>3 questions</option>
                    <option value={5}>5 questions</option>
                    <option value={8}>8 questions</option>
                    <option value={10}>10 questions</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={generateQuestionsWithAI}
                    disabled={aiLoading}
                    style={{ opacity: aiLoading ? 0.7 : 1 }}
                  >
                    {aiLoading ? '⏳ Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: 12, color: '#6b7280' }}>
                  AI will add questions to your form. You can edit or delete them after.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>Questions ({questions.length})</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>These will become the actual questions inside the Google Form</div>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={addQuestion}>+ Add question</button>
              </div>

              {questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} total={questions.length}
                  onChange={updateQuestion} onRemove={removeQuestion} onMove={moveQuestion} />
              ))}

              <button type="button" onClick={addQuestion}
                style={{
                  width: '100%', padding: '12px', border: '2px dashed #d1fae5',
                  borderRadius: 10, background: '#f0fdf4', color: '#1D9E75',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 4, transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.target.style.borderColor = '#1D9E75'}
                onMouseLeave={e => e.target.style.borderColor = '#d1fae5'}
              >+ Add another question</button>

              <div style={{
                marginTop: 16, padding: '12px 16px', background: '#eff6ff',
                border: '1px solid #bfdbfe', borderRadius: 10,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
                <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>
                  <strong>How it works:</strong> When you click "Publish form", FormTrack will automatically
                  create a real Google Form with your questions and save the link. Students will receive
                  this Google Form link to fill out.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Reward & penalty settings</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">On-time reward (marks)</label>
              <input name="onTimeReward" type="number" className="form-input" min="0" max="10"
                value={formData.onTimeReward} onChange={handleChange} />
              <span className="form-hint">Added to internal marks for on-time submissions</span>
            </div>
            <div className="form-group">
              <label className="form-label">Late submission penalty (marks)</label>
              <input name="latePenalty" type="number" className="form-input" min="0" max="10"
                value={formData.latePenalty} onChange={handleChange} />
              <span className="form-hint">Deducted for submissions after deadline</span>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Missed deadline penalty (marks)</label>
              <input name="missedPenalty" type="number" className="form-input" min="0" max="10"
                value={formData.missedPenalty} onChange={handleChange} />
              <span className="form-hint">Deducted when student does not submit at all</span>
            </div>
            <div className="form-group">
              <label className="form-label">Reminder schedule</label>
              <select className="form-select"
                value={JSON.stringify(formData.reminderDays)}
                onChange={e => setFormData(prev => ({ ...prev, reminderDays: JSON.parse(e.target.value) }))}>
                <option value="[3,1]">3 days before + 1 day before</option>
                <option value="[7,3,1]">1 week + 3 days + 1 day before</option>
                <option value="[1]">1 day before only</option>
                <option value="[7,1]">1 week + 1 day before</option>
              </select>
              <span className="form-hint">Automatic email reminders will be sent on these days</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Assign students ({formData.assignedStudents.length} selected)</span>
            <button type="button" className="btn btn-sm" onClick={selectAll}>Select all ({students.length})</button>
          </div>
          {students.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-state-text">No students registered yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {students.map(student => {
                const selected = formData.assignedStudents.includes(student._id);
                return (
                  <div key={student._id} onClick={() => handleStudentToggle(student._id)}
                    style={{
                      padding: '10px 14px',
                      border: `1px solid ${selected ? '#1D9E75' : '#e8ecf0'}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: selected ? '#ecfdf5' : '#fff',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: selected ? '#1D9E75' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      color: selected ? '#fff' : '#9ca3af', flexShrink: 0,
                    }}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? '#065f46' : '#374151' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {student.rollNumber || student.email}
                      </div>
                    </div>
                    {selected && <span style={{ marginLeft: 'auto', color: '#1D9E75', fontSize: 16 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={() => navigate('/teacher')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || generating}>
            {generating ? '⚙️ Generating Google Form...'
              : loading ? 'Publishing...'
              : linkMode === 'auto' ? '🚀 Publish & Generate Google Form'
              : '🚀 Publish form'}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateForm;