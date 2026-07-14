import React, { useState, useEffect, useCallback } from 'react';
import PlatformTab from './PlatformTab';
import Editor from './Editor';
import Validation from './Validation';
import Preview from './Preview';
import { Calendar, CheckCircle, Eye, Image as ImageIcon, Layers, X, XCircle } from 'lucide-react';

const PLATFORM_RULES = {
  twitter: { maxChars: 280, maxMedia: 4, mediaRequired: false, name: 'X (Twitter)' },
  facebook: { maxChars: 63206, maxMedia: 10, mediaRequired: false, name: 'Facebook' },
  instagram: { maxChars: 2200, maxMedia: 10, mediaRequired: true, name: 'Instagram' },
  linkedin: { maxChars: 3000, maxMedia: 9, mediaRequired: false, name: 'LinkedIn' },
};

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

export default function Composer() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);
  const [validationData, setValidationData] = useState({});
  const [history, setHistory] = useState([]);
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

  // Submit/Save draft handler
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
  };

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
          <h1>Multi-Platform Post Composer</h1>
          <p>Compose, validate, and preview posts dynamically across social networks.</p>
        </div>
      </div>

      <div className="composer-grid">
        {/* Workspace Column */}
        <div className="composer-workspace">
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
            onClear={handleClear}
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

      {/* History Database Viewer */}
      <div className="history-section">
        <h3 className="section-title" style={{ margin: 0 }}>
          <Layers size={18} style={{ color: 'var(--accent-primary)' }} /> Database Publish Registry
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Loaded drafts and posts successfully saved to MongoDB Atlas database.
        </p>

        {history.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
            No saved posts inside backend db. Click "Publish Draft" above to add one.
          </div>
        ) : (
          <div className="history-grid">
            {history.map((post) => (
              <div key={post.id} className="history-card">
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
