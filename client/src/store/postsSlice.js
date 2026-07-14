import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';
const DRAFT_STORAGE_KEY = 'socialComposer.localDrafts.v1';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeItems = (items) => {
  const ids = [];
  const entities = {};

  items.forEach((item) => {
    const id = item.id || item._id;
    if (!id) return;
    ids.push(id);
    entities[id] = { ...item, id };
  });

  return { ids, entities };
};

const getDraftArray = (draftsState) => (
  draftsState.ids.map((id) => draftsState.entities[id]).filter(Boolean)
);

const createDraftSnapshot = ({ id, title, content, mediaUrls, platforms, createdAt }) => {
  const now = new Date().toISOString();

  return {
    id: id || crypto.randomUUID(),
    title: title?.trim() || 'Untitled Local Draft',
    content,
    mediaUrls,
    platforms,
    createdAt: createdAt || now,
    updatedAt: now,
  };
};

const persistDrafts = (drafts) => {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
};

export const loadLocalDrafts = createAsyncThunk(
  'posts/loadLocalDrafts',
  async (_, { rejectWithValue }) => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '[]');
      return Array.isArray(savedDrafts) ? savedDrafts : [];
    } catch {
      return rejectWithValue('Local draft storage could not be read. Starting fresh.');
    }
  }
);

export const saveLocalDraft = createAsyncThunk(
  'posts/saveLocalDraft',
  async (_, { getState, rejectWithValue }) => {
    const { composer, localDrafts } = getState().posts;
    const { selectedIds } = getState().platforms;

    if (!composer.content.trim() && composer.mediaUrls.length === 0 && !composer.title.trim()) {
      return rejectWithValue('Add content, media, or a title before saving a local draft.');
    }

    await wait();

    const existingDraft = composer.activeDraftId
      ? localDrafts.entities[composer.activeDraftId]
      : null;
    const draft = createDraftSnapshot({
      id: composer.activeDraftId,
      title: composer.title,
      content: composer.content,
      mediaUrls: composer.mediaUrls,
      platforms: selectedIds,
      createdAt: existingDraft?.createdAt,
    });
    const drafts = getDraftArray(localDrafts);
    const isUpdate = Boolean(existingDraft);
    const nextDrafts = isUpdate
      ? drafts.map((item) => (item.id === draft.id ? draft : item))
      : [draft, ...drafts];

    persistDrafts(nextDrafts);
    return { draft, isUpdate };
  }
);

export const loadDraftIntoComposer = createAsyncThunk(
  'posts/loadDraftIntoComposer',
  async (draftId, { getState, rejectWithValue }) => {
    await wait(250);
    const draft = getState().posts.localDrafts.entities[draftId];

    if (!draft) {
      return rejectWithValue('Local draft could not be found.');
    }

    return draft;
  }
);

export const deleteLocalDraft = createAsyncThunk(
  'posts/deleteLocalDraft',
  async (draftId, { getState }) => {
    await wait(250);
    const remainingDrafts = getDraftArray(getState().posts.localDrafts)
      .filter((draft) => draft.id !== draftId);

    persistDrafts(remainingDrafts);
    return draftId;
  }
);

export const fetchPublishedPosts = createAsyncThunk(
  'posts/fetchPublishedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/posts/history`);
      if (!res.ok) {
        return rejectWithValue('Failed to fetch published posts.');
      }
      return await res.json();
    } catch {
      return rejectWithValue('Failed to connect to published post history.');
    }
  }
);

export const publishCurrentPost = createAsyncThunk(
  'posts/publishCurrentPost',
  async (_, { getState, rejectWithValue }) => {
    const { composer } = getState().posts;
    const { selectedIds } = getState().platforms;

    try {
      const res = await fetch(`${API_BASE}/posts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: composer.title || 'Post Draft',
          content: composer.content,
          mediaCount: composer.mediaUrls.length,
          mediaUrls: composer.mediaUrls,
          platforms: selectedIds,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return rejectWithValue(data.error || 'Failed to publish draft.');
      }

      return data.post;
    } catch {
      return rejectWithValue('Server connection failed. Unable to save draft.');
    }
  }
);

const initialState = {
  composer: {
    title: '',
    content: '',
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
  publishStatus: 'idle',
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setComposerField(state, action) {
      const { field, value } = action.payload;
      state.composer[field] = value;
    },
    clearComposer(state) {
      state.composer.title = '';
      state.composer.content = '';
      state.composer.mediaUrls = [];
      state.composer.activeDraftId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocalDrafts.pending, (state) => {
        state.localDrafts.status = 'loading';
      })
      .addCase(loadLocalDrafts.fulfilled, (state, action) => {
        const normalized = normalizeItems(action.payload);
        state.localDrafts.ids = normalized.ids;
        state.localDrafts.entities = normalized.entities;
        state.localDrafts.status = 'succeeded';
        state.localDrafts.error = null;
      })
      .addCase(loadLocalDrafts.rejected, (state, action) => {
        state.localDrafts.ids = [];
        state.localDrafts.entities = {};
        state.localDrafts.status = 'failed';
        state.localDrafts.error = action.payload;
      })
      .addCase(saveLocalDraft.pending, (state) => {
        state.localDrafts.status = 'saving';
      })
      .addCase(saveLocalDraft.fulfilled, (state, action) => {
        const { draft, isUpdate } = action.payload;
        state.localDrafts.entities[draft.id] = draft;
        if (!isUpdate) {
          state.localDrafts.ids.unshift(draft.id);
        }
        state.composer.activeDraftId = draft.id;
        state.localDrafts.status = 'succeeded';
      })
      .addCase(saveLocalDraft.rejected, (state, action) => {
        state.localDrafts.status = 'failed';
        state.localDrafts.error = action.payload;
      })
      .addCase(loadDraftIntoComposer.pending, (state, action) => {
        state.localDrafts.loadingId = action.meta.arg;
      })
      .addCase(loadDraftIntoComposer.fulfilled, (state, action) => {
        const draft = action.payload;
        state.composer.title = draft.title;
        state.composer.content = draft.content;
        state.composer.mediaUrls = draft.mediaUrls || [];
        state.composer.activeDraftId = draft.id;
        state.localDrafts.loadingId = null;
      })
      .addCase(loadDraftIntoComposer.rejected, (state, action) => {
        state.localDrafts.loadingId = null;
        state.localDrafts.error = action.payload;
      })
      .addCase(deleteLocalDraft.pending, (state, action) => {
        state.localDrafts.loadingId = action.meta.arg;
      })
      .addCase(deleteLocalDraft.fulfilled, (state, action) => {
        const draftId = action.payload;
        delete state.localDrafts.entities[draftId];
        state.localDrafts.ids = state.localDrafts.ids.filter((id) => id !== draftId);
        if (state.composer.activeDraftId === draftId) {
          state.composer.activeDraftId = null;
        }
        state.localDrafts.loadingId = null;
      })
      .addCase(deleteLocalDraft.rejected, (state, action) => {
        state.localDrafts.loadingId = null;
        state.localDrafts.error = action.payload;
      })
      .addCase(fetchPublishedPosts.pending, (state) => {
        state.publishedPosts.status = 'loading';
      })
      .addCase(fetchPublishedPosts.fulfilled, (state, action) => {
        const normalized = normalizeItems(action.payload);
        state.publishedPosts.ids = normalized.ids;
        state.publishedPosts.entities = normalized.entities;
        state.publishedPosts.status = 'succeeded';
      })
      .addCase(fetchPublishedPosts.rejected, (state, action) => {
        state.publishedPosts.status = 'failed';
        state.publishedPosts.error = action.payload;
      })
      .addCase(publishCurrentPost.pending, (state) => {
        state.publishStatus = 'loading';
      })
      .addCase(publishCurrentPost.fulfilled, (state, action) => {
        const post = { ...action.payload, id: action.payload._id || action.payload.id };
        state.publishedPosts.entities[post.id] = post;
        state.publishedPosts.ids = [
          post.id,
          ...state.publishedPosts.ids.filter((id) => id !== post.id),
        ];
        state.composer.title = '';
        state.composer.content = '';
        state.composer.mediaUrls = [];
        state.composer.activeDraftId = null;
        state.publishStatus = 'succeeded';
      })
      .addCase(publishCurrentPost.rejected, (state) => {
        state.publishStatus = 'failed';
      });
  },
});

export const { clearComposer, setComposerField } = postsSlice.actions;

export const selectComposer = (state) => state.posts.composer;
export const selectLocalDrafts = (state) => (
  state.posts.localDrafts.ids.map((id) => state.posts.localDrafts.entities[id]).filter(Boolean)
);
export const selectPublishedPosts = (state) => (
  state.posts.publishedPosts.ids.map((id) => state.posts.publishedPosts.entities[id]).filter(Boolean)
);

export default postsSlice.reducer;
