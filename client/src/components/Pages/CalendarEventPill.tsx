import { memo } from 'react';
import { Clock } from 'lucide-react';
import type { ScheduledPost } from '../../types';

interface CalendarEventPillProps {
  post: ScheduledPost;
  onSelectEvent: (post: ScheduledPost) => void;
}

function CalendarEventPill({ post, onSelectEvent }: CalendarEventPillProps) {
  return (
    <div
      className="calendar-event-pill"
      onClick={() => onSelectEvent(post)}
    >
      <div className="event-pill-top">
        <span className="event-time">
          <Clock size={10} /> {post.scheduledTime}
        </span>
        <div className="event-platforms">
          {post.platforms.map((p) => (
            <span key={p} className={`plat-dot ${p}`} title={p} />
          ))}
        </div>
      </div>
      <span className="event-title">{post.title}</span>
    </div>
  );
}

// React.memo caches individual event pill rendering
export default memo(CalendarEventPill);
