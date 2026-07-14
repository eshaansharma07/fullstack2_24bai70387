import React from 'react';
import { Image as ImageIcon, Trash2, Hash } from 'lucide-react';

export default function Editor({
  title,
  setTitle,
  content,
  setContent,
  mediaUrls,
  setMediaUrls,
  selectedPlatforms,
  onSave,
  onClear,
  validationData
}) {
  const maxCharLimit = selectedPlatforms.reduce((min, platform) => {
    const limits = { twitter: 280, facebook: 63206, instagram: 2200, linkedin: 3000 };
    return Math.min(min, limits[platform]);
  }, Infinity);

  const charCount = content ? content.length : 0;
  const isOverLimit = charCount > maxCharLimit;
  const isCloseToLimit = maxCharLimit !== Infinity && charCount > maxCharLimit - 40;

  // Preset mockup images for students to test
  const sampleImages = [
    { name: 'Tech Desk', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop' },
    { name: 'Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop' },
    { name: 'Meeting', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop' },
    { name: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop' },
  ];

  const addPresetImage = (url) => {
    const maxMediaLimit = selectedPlatforms.reduce((min, platform) => {
      const limits = { twitter: 4, facebook: 10, instagram: 10, linkedin: 9 };
      return Math.min(min, limits[platform]);
    }, Infinity);

    if (mediaUrls.length >= (maxMediaLimit === Infinity ? 10 : maxMediaLimit)) {
      alert(`Max media files limit reached for selected platforms.`);
      return;
    }
    setMediaUrls([...mediaUrls, url]);
  };

  const removeMedia = (index) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const appendHashtag = (tag) => {
    const space = content.endsWith(' ') || content.length === 0 ? '' : ' ';
    setContent(content + space + tag);
  };

  const hashtags = ['#FullStack', '#Coding', '#Experiment1', '#WebDev', '#ReactJS'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="post-title">Post Title (Draft Tag)</label>
        <input
          id="post-title"
          type="text"
          className="form-input"
          placeholder="e.g. Experiment 1 Release Announcement"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Editor Textarea */}
      <div className="form-group">
        <label className="form-label" htmlFor="post-body">Post Content</label>
        <div className="textarea-container">
          <textarea
            id="post-body"
            className="form-input form-textarea"
            placeholder="Type your message here... Make sure it complies with the targeted platforms!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {maxCharLimit !== Infinity && (
            <span className={`character-counter ${isOverLimit ? 'error' : isCloseToLimit ? 'warning' : ''}`}>
              {charCount} / {maxCharLimit.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Hashtag Suggestions */}
      <div className="form-group">
        <label className="form-label">Quick Hashtags</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
              onClick={() => appendHashtag(tag)}
            >
              <Hash size={12} />
              {tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Media Uploader Box */}
      <div className="form-group">
        <label className="form-label">Post Media</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sampleImages.map((img) => (
              <button
                key={img.name}
                type="button"
                className="btn-secondary"
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
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
                    onClick={() => removeMedia(idx)}
                  >
                    ×
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
          className="exp-action btn-primary"
          onClick={onSave}
          style={{ flexGrow: 1 }}
        >
          Publish Draft
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
