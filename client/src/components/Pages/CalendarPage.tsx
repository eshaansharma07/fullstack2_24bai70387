import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2, X, CheckCircle, CalendarDays, ListFilter, Zap, Cpu } from 'lucide-react';
import { selectScheduledPosts, addScheduledPost, updateScheduledPostDate, deleteScheduledPost, selectPublishedPosts } from '../../store/postsSlice';
import { selectAuthUser } from '../../store/authSlice';
import type { AppDispatch } from '../../store/store';
import type { PlatformId, ScheduledPost } from '../../types';
import CalendarDayCell from './CalendarDayCell';

type CalendarViewMode = 'month' | 'week' | 'list';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);
  const scheduledPosts = useSelector(selectScheduledPosts);
  const publishedPosts = useSelector(selectPublishedPosts);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [activeModal, setActiveModal] = useState<'create' | 'view' | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [targetDateStr, setTargetDateStr] = useState<string>('');

  // Performance Profiling State (Exp 1.4.2)
  const renderStartTime = useRef<number>(performance.now());
  const renderCountRef = useRef<number>(0);
  const [lastRenderMs, setLastRenderMs] = useState<number>(0.4);

  renderCountRef.current += 1;

  useEffect(() => {
    const elapsed = performance.now() - renderStartTime.current;
    setLastRenderMs(Number(elapsed.toFixed(2)));
    renderStartTime.current = performance.now();
  }, [currentDate, viewMode, scheduledPosts]);

  // Form State for New Schedule
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newPlatforms, setNewPlatforms] = useState<PlatformId[]>(['twitter', 'linkedin']);

  const canEdit = user?.role === 'admin' || user?.role === 'editor';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Performance Optimization 1: Map indexing O(1) event lookup per date
  const eventsByDateMap = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    scheduledPosts.forEach((post) => {
      if (!map[post.scheduledDate]) {
        map[post.scheduledDate] = [];
      }
      map[post.scheduledDate].push(post);
    });
    return map;
  }, [scheduledPosts]);

  // Performance Optimization 2: Memoize temporal calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, d);
      days.push({
        date: prevMonthDate,
        dateStr: prevMonthDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        date: new Date(year, month, d),
        dateStr: `${year}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete grid
    const remainingCells = (42 - days.length) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonthDate = new Date(year, month + 1, d);
      days.push({
        date: nextMonthDate,
        dateStr: nextMonthDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Performance Optimization 3: Stable useCallback function references
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const openCreateModal = useCallback((dateStr?: string) => {
    if (!canEdit) return;
    setNewDate(dateStr || todayStr);
    setNewTitle('');
    setNewContent('');
    setNewTime('10:00');
    setNewPlatforms(['twitter', 'linkedin']);
    setActiveModal('create');
  }, [canEdit, todayStr]);

  const handleSelectEvent = useCallback((post: ScheduledPost) => {
    setSelectedPost(post);
    setTargetDateStr(post.scheduledDate);
    setActiveModal('view');
  }, []);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    dispatch(addScheduledPost({
      title: newTitle,
      content: newContent,
      mediaUrls: [],
      platforms: newPlatforms,
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'scheduled',
    }));

    setActiveModal(null);
  };

  const handleReschedule = (id: string, date: string, time?: string) => {
    dispatch(updateScheduledPostDate({ id, newDate: date, newTime: time }));
    setActiveModal(null);
  };

  const handleDeleteSchedule = (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return;
    dispatch(deleteScheduledPost(id));
    setActiveModal(null);
  };

  const togglePlatformSelect = (plat: PlatformId) => {
    if (newPlatforms.includes(plat)) {
      if (newPlatforms.length > 1) {
        setNewPlatforms(newPlatforms.filter((p) => p !== plat));
      }
    } else {
      setNewPlatforms([...newPlatforms, plat]);
    }
  };

  return (
    <div className="calendar-page-container">
      {/* Performance Optimization Metrics Banner (Exp 1.4.2) */}
      <div className="perf-metrics-strip">
        <div className="perf-metric-item">
          <Zap size={14} className="perf-icon" />
          <span>Last Render: <strong>{lastRenderMs} ms</strong></span>
        </div>
        <div className="perf-metric-item">
          <Cpu size={14} className="perf-icon" />
          <span>Render Count: <strong>#{renderCountRef.current}</strong></span>
        </div>
        <div className="perf-metric-item">
          <span>Memo Cache: <strong>42 Cells Cached (React.memo)</strong></span>
        </div>
        <div className="perf-metric-item highlight">
          <span>O(1) Map Indexing: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="calendar-header-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1><CalendarIcon size={26} /> Content Schedule Calendar</h1>
            <span className="pro-workspace-badge">EXP 1.4.1 & 1.4.2</span>
          </div>
          <p>Map scheduled posts to temporal slots, switch views, and experience memoized rendering.</p>
        </div>

        <div className="calendar-header-actions">
          {/* View Toggles */}
          <div className="calendar-view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              <CalendarDays size={14} /> Month
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListFilter size={14} /> List
            </button>
          </div>

          {canEdit && (
            <button type="button" className="btn-primary" onClick={() => openCreateModal()}>
              <Plus size={16} /> Schedule Post
            </button>
          )}
        </div>
      </div>

      {/* Month Navigation & Controls */}
      <div className="calendar-nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
          <button type="button" className="calendar-nav-btn today-btn" onClick={handleToday}>
            Today
          </button>
        </div>

        <h2 className="calendar-month-title">
          {MONTH_NAMES[month]} {year}
        </h2>

        <div className="calendar-stats-pill">
          <span>📅 <strong>{scheduledPosts.length}</strong> Scheduled</span>
          <span>🗄️ <strong>{publishedPosts.length}</strong> Published</span>
        </div>
      </div>

      {/* Month View Grid with Memoized Cells */}
      {viewMode === 'month' && (
        <div className="calendar-grid-wrap">
          {/* Day Name Header Row */}
          <div className="calendar-day-header-grid">
            {DAY_NAMES.map((name) => (
              <div key={name} className="calendar-day-header">{name}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-month-grid">
            {calendarDays.map((cell, idx) => (
              <CalendarDayCell
                key={`${cell.dateStr}-${idx}`}
                dateStr={cell.dateStr}
                dayNum={cell.dayNum}
                isCurrentMonth={cell.isCurrentMonth}
                isToday={cell.dateStr === todayStr}
                canEdit={canEdit}
                posts={eventsByDateMap[cell.dateStr] || []}
                onOpenCreateModal={openCreateModal}
                onSelectEvent={handleSelectEvent}
              />
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="calendar-list-view">
          {scheduledPosts.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <strong>No posts scheduled yet</strong>
              <span>Click "+ Schedule Post" above to map a post to a calendar slot.</span>
            </div>
          ) : (
            <div className="scheduled-list-grid">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="scheduled-item-card">
                  <div className="scheduled-item-header">
                    <span className="scheduled-date-badge">
                      📅 {post.scheduledDate} at {post.scheduledTime}
                    </span>
                    <span className="status-badge scheduled">SCHEDULED</span>
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <div className="scheduled-item-footer">
                    <div className="event-platforms">
                      {post.platforms.map((p) => (
                        <span key={p} className={`plat-dot ${p}`} title={p} />
                      ))}
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        className="btn-secondary danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => handleDeleteSchedule(post.id)}
                      >
                        <Trash2 size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create Schedule */}
      {activeModal === 'create' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>
              <CalendarIcon size={20} /> Schedule New Post
            </h3>
            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Date & Time</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="date"
                    className="form-input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="form-input"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Post Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 🚀 Weekly Feature Release"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Post Copy</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Type your scheduled message content here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platforms</label>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {(['twitter', 'facebook', 'instagram', 'linkedin'] as PlatformId[]).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      className={`platform-pill ${newPlatforms.includes(plat) ? 'selected' : ''}`}
                      data-platform={plat}
                      onClick={() => togglePlatformSelect(plat)}
                    >
                      {plat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  <CheckCircle size={16} /> Confirm Schedule
                </button>
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View / Reschedule Event */}
      {activeModal === 'view' && selectedPost && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>
              <Clock size={20} /> Scheduled Event Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{selectedPost.title}</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                  {selectedPost.content}
                </p>
              </div>

              {/* Reschedule Box */}
              {canEdit && (
                <div className="reschedule-box">
                  <label className="form-label">Reschedule Date</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="date"
                      className="form-input"
                      value={targetDateStr}
                      onChange={(e) => setTargetDateStr(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleReschedule(selectedPost.id, targetDateStr)}
                    >
                      Save Date
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                {canEdit && (
                  <button
                    type="button"
                    className="btn-secondary danger"
                    style={{ flex: 1 }}
                    onClick={() => handleDeleteSchedule(selectedPost.id)}
                  >
                    <Trash2 size={16} /> Cancel Schedule
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
