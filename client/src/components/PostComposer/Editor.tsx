import { memo, useMemo } from 'react';
import { Database, Hash, Image as ImageIcon, Save, Trash2, X } from 'lucide-react';
import type { PlatformId } from '../../types';

interface EditorProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  mediaUrls: string[];
  setMediaUrls: (value: string[]) => void;
  selectedPlatforms: PlatformId[];
  onSave: () => void;
  onSaveLocalDraft: () => void;
  onClear: () => void;
  isDraftSaving: boolean;
  isPublishing: boolean;
  activeDraftId: string | null;
}

const characterLimits: Record<PlatformId, number> = {
  twitter: 280,
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
};

const mediaLimits: Record<PlatformId, number> = {
  twitter: 4,
  facebook: 10,
  instagram: 10,
  linkedin: 9,
};

const sampleImages = [
  { name: 'Tech Desk', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop' },
  { name: 'Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop' },
  { name: 'Meeting', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop' },
  { name: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop' },
];

const hashtags = ['#Launch', '#Growth', '#Design', '#WebDev', '#Social'];

function Editor({
  title,
  setTitle,
  content,
  setContent,
  mediaUrls,
  setMediaUrls,
  selectedPlatforms,
  onSave,
  onSaveLocalDraft,
  onClear,
  isDraftSaving,
  isPublishing,
  activeDraftId
}: EditorProps) {
  const maxCharLimit = useMemo(() => (
    selectedPlatforms.reduce((min, platform) => Math.min(min, characterLimits[platform]), Infinity)
  ), [selectedPlatforms]);

  const maxMediaLimit = useMemo(() => (
    selectedPlatforms.reduce((min, platform) => Math.min(min, mediaLimits[platform]), Infinity)
  ), [selectedPlatforms]);

  const charCount = content ? content.length : 0;
  const isOverLimit = charCount > maxCharLimit;
  const isCloseToLimit = maxCharLimit !== Infinity && charCount > maxCharLimit - 40;

  const addPresetImage = (url: string) => {
    if (mediaUrls.length >= (maxMediaLimit === Infinity ? 10 : maxMediaLimit)) {
      alert(`Max media files limit reached for selected platforms.`);
      return;
    }
    setMediaUrls([...mediaUrls, url]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const appendHashtag = (tag: string) => {
    const space = content.endsWith(' ') || content.length === 0 ? '' : ' ';
    setContent(content + space + tag);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="post-title">
          <span className="section-badge-tag">🏷️ DRAFT TAG</span> Post Title
        </label>
        <input
          id="post-title"
          type="text"
          className="form-input"
          placeholder="e.g. 🚀 Product Launch Update Q3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Editor Textarea */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <label className="form-label" htmlFor="post-body" style={{ margin: 0 }}>
            <span className="section-badge-tag">✍️ COMPOSER</span> Post Copy
          </label>
          {maxCharLimit !== Infinity && (
            <span className={`character-counter-badge ${isOverLimit ? 'error' : isCloseToLimit ? 'warning' : ''}`}>
              {charCount} / {maxCharLimit.toLocaleString()} chars
            </span>
          )}
        </div>
        
        {/* Dynamic Character Progress Bar */}
        {maxCharLimit !== Infinity && (
          <div className="char-progress-track">
            <div
              className={`char-progress-bar ${isOverLimit ? 'over' : isCloseToLimit ? 'near' : ''}`}
              style={{ width: `${Math.min(100, (charCount / maxCharLimit) * 100)}%` }}
            />
          </div>
        )}

        <div className="textarea-container" style={{ marginTop: '0.35rem' }}>
          <textarea
            id="post-body"
            className="form-input form-textarea"
            placeholder="Type your message here... Make sure it complies with the targeted platforms!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>
      </div>

      {/* Quick Templates & Hashtags */}
      <div className="form-group">
        <label className="form-label">
          <span className="section-badge-tag">⚡ QUICK HASHTAGS</span> Tap to Add
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="hashtag-pill-btn"
              onClick={() => appendHashtag(tag)}
            >
              <Hash size={13} />
              {tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Media Uploader Box */}
      <div className="form-group">
        <label className="form-label">
          <span className="section-badge-tag">🖼️ MEDIA ATTACHMENTS</span> Add Sample Assets
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sampleImages.map((img) => (
              <button
                key={img.name}
                type="button"
                className="media-preset-btn"
                onClick={() => addPresetImage(img.url)}
              >
                <ImageIcon size={14} />
                + {img.name}
              </button>
            ))}
          </div>

          {mediaUrls.length > 0 && (
            <div className="media-previews-grid">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="media-preview-item">
                  <img src={url} alt="Uploaded attachment preview" />
                  <button
                    type="button"
                    className="remove-media-btn"
                    aria-label={`Remove media attachment ${idx + 1}`}
                    onClick={() => removeMedia(idx)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="composer-actions">
        <button
          type="button"
          className="exp-action btn-secondary"
          onClick={onSaveLocalDraft}
          disabled={isDraftSaving}
          style={{ flexGrow: 1 }}
        >
          <Save size={16} />
          {isDraftSaving ? 'Saving Draft' : activeDraftId ? 'Update Local Draft' : 'Save Local Draft'}
        </button>
        <button
          type="button"
          className="exp-action btn-primary"
          onClick={onSave}
          disabled={isPublishing}
          style={{ flexGrow: 1 }}
        >
          <Database size={16} />
          {isPublishing ? 'Publishing' : 'Publish to Database'}
        </button>
        <button
          type="button"
          className="exp-action btn-secondary"
          onClick={onClear}
          style={{ width: 'fit-content' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default memo(Editor);
