import { memo } from 'react';
import type { ScheduledPost } from '../../types';
import CalendarEventPill from './CalendarEventPill';

interface CalendarDayCellProps {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  canEdit: boolean;
  posts: ScheduledPost[];
  onOpenCreateModal: (dateStr: string) => void;
  onSelectEvent: (post: ScheduledPost) => void;
}

function CalendarDayCell({
  dateStr,
  dayNum,
  isCurrentMonth,
  isToday,
  canEdit,
  posts,
  onOpenCreateModal,
  onSelectEvent,
}: CalendarDayCellProps) {
  return (
    <div
      className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
    >
      <div className="day-cell-top">
        <span className="day-number">{dayNum}</span>
        {isToday && <span className="today-chip">TODAY</span>}
        {canEdit && (
          <button
            type="button"
            className="cell-add-btn"
            title={`Schedule post for ${dateStr}`}
            onClick={() => onOpenCreateModal(dateStr)}
          >
            +
          </button>
        )}
      </div>

      <div className="day-events-list">
        {posts.map((post) => (
          <CalendarEventPill
            key={post.id}
            post={post}
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
}

// React.memo prevents re-rendering unchanged day cells when another cell's event updates!
export default memo(CalendarDayCell);
