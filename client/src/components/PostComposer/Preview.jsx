import React, { useState, useEffect } from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Heart, MessageCircle, Share2, Send, Bookmark, MoreHorizontal, ThumbsUp } from 'lucide-react';

export default function Preview({ content, mediaUrls, selectedPlatforms }) {
  const [activeTab, setActiveTab] = useState('');

  // Auto-switch to the first selected platform
  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      if (!selectedPlatforms.includes(activeTab)) {
        setActiveTab(selectedPlatforms[0]);
      }
    } else {
      setActiveTab('');
    }
  }, [selectedPlatforms, activeTab]);

  if (selectedPlatforms.length === 0) {
    return (
      <div className="preview-container">
        <h3 className="section-title">Live Preview</h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          Select a platform above to preview your post draft.
        </div>
      </div>
    );
  }

  const renderMediaGrid = (platform) => {
    if (mediaUrls.length === 0) return null;

    let gridClass = 'tweet-media-grid';
    if (platform === 'twitter') {
      const count = Math.min(mediaUrls.length, 4);
      gridClass = `tweet-media-grid media-${count}`;
      return (
        <div className={gridClass}>
          {mediaUrls.slice(0, 4).map((url, index) => (
            <img key={index} src={url} alt={`attachment-${index}`} />
          ))}
        </div>
      );
    }

    if (platform === 'facebook') {
      return (
        <div className="fb-media">
          {mediaUrls.map((url, index) => (
            <img key={index} src={url} alt={`attachment-${index}`} />
          ))}
        </div>
      );
    }

    if (platform === 'instagram') {
      return (
        <div className="ig-media-box">
          <img src={mediaUrls[0]} alt="Instagram attachment" />
        </div>
      );
    }

    if (platform === 'linkedin') {
      return (
        <div className="li-media">
          <img src={mediaUrls[0]} alt="LinkedIn attachment" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="preview-container">
      <h3 className="section-title">Live Preview</h3>
      
      {/* Tabs */}
      <div className="preview-tabs">
        {selectedPlatforms.map((plat) => {
          const tabLabel = plat === 'twitter' ? 'X (Twitter)' : plat.charAt(0).toUpperCase() + plat.slice(1);
          return (
            <button
              key={plat}
              type="button"
              className={`preview-tab ${activeTab === plat ? 'active' : ''}`}
              data-platform={plat}
              onClick={() => setActiveTab(plat)}
            >
              {plat === 'twitter' && <Twitter size={14} />}
              {plat === 'facebook' && <Facebook size={14} />}
              {plat === 'instagram' && <Instagram size={14} />}
              {plat === 'linkedin' && <Linkedin size={14} />}
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* Render Mock Social Card */}
      {activeTab === 'twitter' && (
        <div className="mock-card mock-twitter">
          <div className="tweet-header">
            <div className="tweet-avatar">AU</div>
            <div className="tweet-user-info">
              <span className="tweet-name">Academic Student</span>
              <span className="tweet-handle">@student_dev · 2h</span>
            </div>
            <MoreHorizontal size={16} style={{ marginLeft: 'auto', color: '#536471' }} />
          </div>
          <div className="tweet-body">
            {content || <span style={{ color: '#536471', fontStyle: 'italic' }}>What is happening?! (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('twitter')}
          <div className="tweet-actions">
            <MessageCircle size={16} />
            <Share2 size={16} />
            <Heart size={16} />
            <Send size={16} />
          </div>
        </div>
      )}

      {activeTab === 'facebook' && (
        <div className="mock-card mock-facebook">
          <div className="fb-header">
            <div className="fb-avatar">AU</div>
            <div className="fb-user-details">
              <span className="fb-username">Academic Student</span>
              <span className="fb-time">Just now · 🌐</span>
            </div>
            <MoreHorizontal size={18} style={{ marginLeft: 'auto', color: '#65676b' }} />
          </div>
          <div className="fb-body">
            {content || <span style={{ color: '#65676b', fontStyle: 'italic' }}>What's on your mind? (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('facebook')}
          <div className="fb-actions">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ThumbsUp size={16} /> Like</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MessageCircle size={16} /> Comment</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Share2 size={16} /> Share</span>
          </div>
        </div>
      )}

      {activeTab === 'instagram' && (
        <div className="mock-card mock-instagram">
          <div className="ig-header">
            <div className="ig-avatar">
              <div className="ig-avatar-inner" />
            </div>
            <span className="ig-username">student_developer</span>
            <MoreHorizontal size={18} style={{ marginLeft: 'auto', color: '#262626' }} />
          </div>
          
          {mediaUrls.length > 0 ? (
            renderMediaGrid('instagram')
          ) : (
            <div className="ig-media-box">
              <div className="ig-placeholder">
                <Instagram size={36} strokeWidth={1.5} />
                <span>Upload image to preview Instagram feed</span>
              </div>
            </div>
          )}

          <div className="ig-actions">
            <Heart size={20} />
            <MessageCircle size={20} />
            <Send size={20} />
            <Bookmark size={20} style={{ marginLeft: 'auto' }} />
          </div>
          
          <div className="ig-likes">
            1,204 likes
          </div>

          <div className="ig-caption-box">
            <span className="ig-caption-user">student_developer</span>
            <span className="ig-caption-text">
              {content || <span style={{ color: '#8e8e8e', fontStyle: 'italic' }}>Draft content will appear here</span>}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'linkedin' && (
        <div className="mock-card mock-linkedin">
          <div className="li-header">
            <div className="li-avatar">AU</div>
            <div className="li-user-details">
              <span className="li-username">Academic Student</span>
              <span className="li-headline">Full Stack Engineering Student</span>
              <span className="li-time">1h · 🌐</span>
            </div>
            <MoreHorizontal size={18} style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.6)' }} />
          </div>
          <div className="li-body">
            {content || <span style={{ color: 'rgba(0,0,0,0.6)', fontStyle: 'italic' }}>What do you want to talk about? (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('linkedin')}
          <div className="li-actions">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ThumbsUp size={16} /> Like</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MessageCircle size={16} /> Comment</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Share2 size={16} /> Share</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Send size={16} /> Send</span>
          </div>
        </div>
      )}
    </div>
  );
}
