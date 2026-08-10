import { describe, it, expect } from 'vitest';
import postsReducer, {
  addScheduledPost,
  updateScheduledPostDate,
  deleteScheduledPost,
  setComposerField,
  clearComposer,
} from '../store/postsSlice';
import type { PostsState } from '../types';

describe('postsSlice Redux Reducers', () => {
  const getInitialState = (): PostsState => ({
    composer: {
      title: 'Draft Post',
      content: 'Draft content',
      mediaUrls: [],
      activeDraftId: null,
    },
    localDrafts: {
      ids: [],
      entities: {},
      status: 'idle',
      loadingId: null,
      error: null,
    },
    publishedPosts: {
      ids: [],
      entities: {},
      status: 'idle',
      error: null,
    },
    scheduledPosts: {
      ids: ['sched_100'],
      entities: {
        sched_100: {
          id: 'sched_100',
          title: 'Initial Test Event',
          content: 'Testing initial content',
          mediaUrls: [],
          platforms: ['twitter'],
          scheduledDate: '2026-08-15',
          scheduledTime: '12:00',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        },
      },
    },
    publishStatus: 'idle',
  });

  it('should add a new scheduled post to state', () => {
    const initialState = getInitialState();
    const action = addScheduledPost({
      id: 'sched_200',
      title: '🚀 Launch Event',
      content: 'Launching new version!',
      mediaUrls: [],
      platforms: ['twitter', 'linkedin'],
      scheduledDate: '2026-08-20',
      scheduledTime: '15:00',
      status: 'scheduled',
    });

    const newState = postsReducer(initialState, action);

    expect(newState.scheduledPosts.ids).toContain('sched_200');
    expect(newState.scheduledPosts.entities['sched_200'].title).toBe('🚀 Launch Event');
    expect(newState.scheduledPosts.entities['sched_200'].scheduledDate).toBe('2026-08-20');
  });

  it('should update scheduled post date and time', () => {
    const initialState = getInitialState();
    const action = updateScheduledPostDate({
      id: 'sched_100',
      newDate: '2026-08-25',
      newTime: '18:30',
    });

    const newState = postsReducer(initialState, action);

    expect(newState.scheduledPosts.entities['sched_100'].scheduledDate).toBe('2026-08-25');
    expect(newState.scheduledPosts.entities['sched_100'].scheduledTime).toBe('18:30');
  });

  it('should delete a scheduled post from state', () => {
    const initialState = getInitialState();
    const action = deleteScheduledPost('sched_100');

    const newState = postsReducer(initialState, action);

    expect(newState.scheduledPosts.ids).not.toContain('sched_100');
    expect(newState.scheduledPosts.entities['sched_100']).toBeUndefined();
  });

  it('should set composer field and clear composer', () => {
    const initialState = getInitialState();
    const setAction = setComposerField({ field: 'title', value: 'Updated Title' });
    let state = postsReducer(initialState, setAction);

    expect(state.composer.title).toBe('Updated Title');

    state = postsReducer(state, clearComposer());
    expect(state.composer.title).toBe('');
    expect(state.composer.content).toBe('');
  });
});
