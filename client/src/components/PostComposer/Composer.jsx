import React, { useState, useEffect, useCallback } from 'react';
import PlatformTab from './PlatformTab';
import Editor from './Editor';
import Validation from './Validation';
import Preview from './Preview';
import {
  Calendar,
  CheckCircle,
  Database,
  Eye,
  FilePenLine,
  Image as ImageIcon,
  Layers,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  X,
  XCircle
} from 'lucide-react';

const PLATFORM_RULES = {
  twitter: { maxChars: 280, maxMedia: 4, mediaRequired: false, name: 'X (Twitter)' },
  facebook: { maxChars: 63206, maxMedia: 10, mediaRequired: false, name: 'Facebook' },
  instagram: { maxChars: 2200, maxMedia: 10, mediaRequired: true, name: 'Instagram' },
  linkedin: { maxChars: 3000, maxMedia: 9, mediaRequired: false, name: 'LinkedIn' },
};

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';
const DRAFT_STORAGE_KEY = 'socialComposer.localDrafts.v1';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const createDraftSnapshot = ({ id, title, content, mediaUrls, platforms }) => {
  const now = new Date().toISOString();

  return {
    id: id || crypto.randomUUID(),
    title: title?.trim() || 'Untitled Local Draft',
    content,
    mediaUrls,
    platforms,
    updatedAt: now,
    createdAt: now,
  };
};

export default function Composer() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);
  const [validationData, setValidationData] = useState({});
  const [history, setHistory] = useState([]);
  const [localDrafts, setLocalDrafts] = useState([]);
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [draftLoadingId, setDraftLoadingId] = useState(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeModalPost, setActiveModalPost] = useState(null);

  // Helper: Trigger toast notification
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Toggle platform selection
  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  // Load publication/draft history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/posts/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history from backend:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '[]');
      if (Array.isArray(savedDrafts)) {
        setLocalDrafts(savedDrafts);
      }
    } catch {
      setLocalDrafts([]);
      showToast('Local draft storage could not be read. Starting fresh.', true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(localDrafts));
  }, [localDrafts]);

  // Robust client-side fallback validation when the server is offline.
  const runFallbackValidation = useCallback(() => {
    const fallbackResults = {};

    selectedPlatforms.forEach((platform) => {
      const rule = PLATFORM_RULES[platform];
      const errors = [];
      const warnings = [];
      const count = content ? content.length : 0;

      if (count > rule.maxChars) {
        errors.push(`Character count (${count.toLocaleString()}) exceeds the limit of ${rule.maxChars.toLocaleString()} for ${rule.name}.`);
      }
      if (mediaUrls.length > rule.maxMedia) {
        errors.push(`Media count (${mediaUrls.length}) exceeds the limit of ${rule.maxMedia} for ${rule.name}.`);
      }
      if (rule.mediaRequired && mediaUrls.length === 0) {
        errors.push(`At least one image or video is required to post on ${rule.name}.`);
      }
      if (platform === 'twitter' && count > 240 && count <= 280) {
        warnings.push('You are close to the limit! Consider shortening your content.');
      }
      if (platform === 'instagram' && !content.includes('#')) {
        warnings.push('Adding hashtags to your Instagram post can improve its visibility.');
      }
      if (platform === 'linkedin' && content.length < 50) {
        warnings.push('LinkedIn posts with longer, insightful content perform better.');
      }

      fallbackResults[platform] = {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    });

    setValidationData(fallbackResults);
  }, [content, mediaUrls.length, selectedPlatforms]);

  // Real-time validation trigger (debounced)
  useEffect(() => {
    if (selectedPlatforms.length === 0) {
      setValidationData({});
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            mediaCount: mediaUrls.length,
            platforms: selectedPlatforms,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setValidationData(data.results);
        } else {
          // If server fails or is offline, perform fallback client-side validation
          runFallbackValidation();
        }
      } catch {
        runFallbackValidation();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [content, mediaUrls.length, selectedPlatforms, runFallbackValidation]);

  const handleSaveLocalDraft = async () => {
    if (!content.trim() && mediaUrls.length === 0 && !title.trim()) {
      showToast('Add content, media, or a title before saving a local draft.', true);
      return;
    }

    setIsDraftSaving(true);

    try {
      await wait();

      const draft = createDraftSnapshot({
        id: activeDraftId,
        title,
        content,
        mediaUrls,
        platforms: selectedPlatforms,
      });

      setLocalDrafts((drafts) => {
        const existingDraft = drafts.find((item) => item.id === draft.id);
        if (existingDraft) {
          return drafts.map((item) => (
            item.id === draft.id
              ? { ...draft, createdAt: item.createdAt }
              : item
          ));
        }

        return [draft, ...drafts];
      });
      setActiveDraftId(draft.id);
      showToast(activeDraftId ? 'Local draft updated in browser storage.' : 'Local draft saved in browser storage.');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleLoadLocalDraft = async (draft) => {
    setDraftLoadingId(draft.id);

    try {
      await wait(250);
      setTitle(draft.title);
      setContent(draft.content);
      setMediaUrls(draft.mediaUrls || []);
      setSelectedPlatforms(draft.platforms?.length ? draft.platforms : ['twitter']);
      setActiveDraftId(draft.id);
      showToast('Local draft loaded into composer.');
    } finally {
      setDraftLoadingId(null);
    }
  };

  const handleDeleteLocalDraft = async (draftId) => {
    setDraftLoadingId(draftId);

    try {
      await wait(250);
      setLocalDrafts((drafts) => drafts.filter((draft) => draft.id !== draftId));
      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }
      showToast('Local draft deleted.');
    } finally {
      setDraftLoadingId(null);
    }
  };

  // Submit/publish handler
  const handleSave = async () => {
    if (selectedPlatforms.length === 0) {
      showToast('Select at least one social media platform.', true);
      return;
    }

    // Check validation data first
    let hasErrors = false;
    selectedPlatforms.forEach((p) => {
      if (validationData[p] && !validationData[p].isValid) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      showToast('Please fix constraints and validation errors before saving.', true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/posts/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Post Draft',
          content,
          mediaCount: mediaUrls.length,
          mediaUrls,
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Post draft successfully saved to persistence database!');
        handleClear();
        fetchHistory(); // Refresh history list
      } else {
        showToast(data.error || 'Failed to publish draft.', true);
      }
    } catch {
      showToast('Server connection failed. Unable to save draft.', true);
    }
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setMediaUrls([]);
    setActiveDraftId(null);
  };

  const activeDraft = localDrafts.find((draft) => draft.id === activeDraftId);

  return (
    <div>
      {/* Toast popup */}
      {toast && (
        <div className={`toast ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <XCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="experiment-kicker">Experiment 2 / Frontend Draft Management</span>
          <h1>SocialComposer Draft Studio</h1>
          <p>Build, save, edit, delete, validate, and publish posts through a frontend-first workflow.</p>
        </div>
        <div className="dashboard-stats-strip" aria-label="Draft workflow statistics">
          <div>
            <strong>{localDrafts.length}</strong>
            <span>local drafts</span>
          </div>
          <div>
            <strong>{history.length}</strong>
            <span>db posts</span>
          </div>
        </div>
      </div>

      <div className="experiment-banner">
        <div>
          <span>CO2 - BT2 / CO3 - BT3</span>
          <strong>Frontend CRUD with mock async APIs and localStorage persistence</strong>
        </div>
        <Sparkles size={28} />
      </div>

      <div className="composer-grid">
        {/* Workspace Column */}
        <div className="composer-workspace">
          {activeDraft && (
            <div className="active-draft-ribbon">
              <FilePenLine size={16} />
              Editing local draft: <strong>{activeDraft.title}</strong>
            </div>
          )}
          <PlatformTab
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
          />
          <Editor
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            mediaUrls={mediaUrls}
            setMediaUrls={setMediaUrls}
            selectedPlatforms={selectedPlatforms}
            onSave={handleSave}
            onSaveLocalDraft={handleSaveLocalDraft}
            onClear={handleClear}
            isDraftSaving={isDraftSaving}
            activeDraftId={activeDraftId}
          />
          <Validation
            validationData={validationData}
            selectedPlatforms={selectedPlatforms}
          />
        </div>

        {/* Live Preview Column */}
        <Preview
          content={content}
          mediaUrls={mediaUrls}
          selectedPlatforms={selectedPlatforms}
        />
      </div>

      {/* Frontend Draft Manager */}
      <section className="draft-manager-section">
        <div className="draft-manager-header">
          <div>
            <span className="experiment-kicker">Frontend State + localStorage</span>
            <h3 className="section-title" style={{ margin: 0 }}>
              <Save size={18} /> Local Draft Control Room
            </h3>
          </div>
          <p>
            Drafts below are managed entirely in the browser with simulated async save, load, update, and delete flows.
          </p>
        </div>

        {localDrafts.length === 0 ? (
          <div className="draft-empty-state">
            <FilePenLine size={32} />
            <strong>No local drafts saved yet.</strong>
            <span>Use "Save Local Draft" in the composer to create the first frontend-managed draft.</span>
          </div>
        ) : (
          <div className="draft-grid">
            {localDrafts.map((draft, index) => (
              <article
                key={draft.id}
                className={`draft-card ${draft.id === activeDraftId ? 'active' : ''}`}
                style={{ '--draft-index': `"${String(index + 1).padStart(2, '0')}"` }}
              >
                <div className="draft-card-topline">
                  <span>Draft {String(index + 1).padStart(2, '0')}</span>
                  <time>
                    {new Date(draft.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <h4>{draft.title}</h4>
                <p>{draft.content || 'Media-only draft without body copy.'}</p>
                <div className="draft-card-meta">
                  <span><Layers size={12} /> {draft.platforms.length} platform{draft.platforms.length !== 1 ? 's' : ''}</span>
                  <span><ImageIcon size={12} /> {draft.mediaUrls.length} media</span>
                </div>
                <div className="draft-card-actions">
                  <button
                    type="button"
                    className="btn-secondary icon-action"
                    onClick={() => handleLoadLocalDraft(draft)}
                    disabled={draftLoadingId === draft.id}
                  >
                    <Pencil size={14} />
                    {draftLoadingId === draft.id ? 'Loading' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary icon-action danger"
                    onClick={() => handleDeleteLocalDraft(draft.id)}
                    disabled={draftLoadingId === draft.id}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* History Database Viewer */}
      <div className="history-section">
        <h3 className="section-title" style={{ margin: 0 }}>
          <Database size={18} style={{ color: 'var(--accent-primary)' }} /> Database Publish Registry
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Loaded drafts and posts successfully saved to MongoDB Atlas database.
        </p>

        {history.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
            No saved posts inside backend db. Click "Publish to Database" above to add one.
          </div>
        ) : (
          <div className="history-grid">
            {history.map((post) => (
              <div key={post._id || post.id} className="history-card">
                <div className="history-meta">
                  <span className="history-date">
                    <Calendar size={10} style={{ marginRight: '0.25rem', display: 'inline' }} />
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="history-platforms">
                    {post.platforms.map((plat) => (
                      <span
                        key={plat}
                        className={`history-platform-dot ${plat}`}
                        title={plat}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="history-post-title">{post.title}</h4>
                <p className="history-post-content">{post.content}</p>
                <div className="history-post-media-count">
                  <ImageIcon size={14} />
                  {post.mediaCount} attached media asset{post.mediaCount !== 1 ? 's' : ''}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    marginTop: '0.75rem',
                    cursor: 'pointer',
                    width: '100%',
                    borderRadius: '6px'
                  }}
                  onClick={() => setActiveModalPost(post)}
                >
                  <Eye size={14} />
                  View Published Feed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Post Mock Preview Modal */}
      {activeModalPost && (
        <div className="modal-overlay" onClick={() => setActiveModalPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              aria-label="Close published feed preview"
              onClick={() => setActiveModalPost(null)}
            >
              <X size={18} />
            </button>
            <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>
              Published Feed Preview: {activeModalPost.title}
            </h3>
            <Preview
              content={activeModalPost.content}
              mediaUrls={activeModalPost.mediaUrls}
              selectedPlatforms={activeModalPost.platforms}
            />
          </div>
        </div>
      )}
    </div>
  );
}
