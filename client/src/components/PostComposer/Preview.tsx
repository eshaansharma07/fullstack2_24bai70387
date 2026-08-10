import { memo, useState, useEffect } from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Heart, MessageCircle, Share2, Send, Bookmark, MoreHorizontal, ThumbsUp, Repeat2, Smartphone, Monitor } from 'lucide-react';
import type { PlatformId } from '../../types';

interface PreviewProps {
  content: string;
  mediaUrls: string[];
  selectedPlatforms: PlatformId[];
}

function Preview({ content, mediaUrls, selectedPlatforms }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<PlatformId | ''>('');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [likeCount, setLikeCount] = useState<number>(142);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [retweetCount, setRetweetCount] = useState<number>(28);
  const [isRetweeted, setIsRetweeted] = useState<boolean>(false);

  // Auto-switch to the first selected platform
  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      if (activeTab === '' || !selectedPlatforms.includes(activeTab)) {
        setActiveTab(selectedPlatforms[0]);
      }
    } else {
      setActiveTab('');
    }
  }, [selectedPlatforms, activeTab]);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const toggleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    setRetweetCount(isRetweeted ? retweetCount - 1 : retweetCount + 1);
  };

  if (selectedPlatforms.length === 0) {
    return (
      <div className="preview-container">
        <h3 className="section-title">
          <span className="section-badge-tag">👁️ LIVE PREVIEW</span> Feed Simulator
        </h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '3px solid var(--border)',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-small)'
        }}>
          Select a platform above to preview your post draft.
        </div>
      </div>
    );
  }

  const renderMediaGrid = (platform: PlatformId) => {
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
    <div className={`preview-container ${deviceMode}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          Feed Simulator
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="device-toggle-bar">
            <button
              type="button"
              className={`device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceMode('mobile')}
              title="Mobile View"
            >
              <Smartphone size={13} />
            </button>
            <button
              type="button"
              className={`device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceMode('desktop')}
              title="Desktop View"
            >
              <Monitor size={13} />
            </button>
          </div>
          <span className="live-status-pill">● REAL-TIME</span>
        </div>
      </div>
      
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
            <div className="tweet-avatar">ES</div>
            <div className="tweet-user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="tweet-name">Eshaan Sharma</span>
                <span className="verified-badge" title="Verified Creator">✓</span>
              </div>
              <span className="tweet-handle">@eshaansharma · 2h</span>
            </div>
            <MoreHorizontal size={16} style={{ marginLeft: 'auto', color: '#536471' }} />
          </div>
          <div className="tweet-body">
            {content || <span style={{ color: '#536471', fontStyle: 'italic' }}>What is happening?! (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('twitter')}
          <div className="tweet-actions">
            <button type="button" className="action-btn-item">
              <MessageCircle size={15} /> 12
            </button>
            <button type="button" className={`action-btn-item ${isRetweeted ? 'retweeted' : ''}`} onClick={toggleRetweet}>
              <Repeat2 size={15} /> {retweetCount}
            </button>
            <button type="button" className={`action-btn-item ${isLiked ? 'liked' : ''}`} onClick={toggleLike}>
              <Heart size={15} fill={isLiked ? '#f91880' : 'none'} color={isLiked ? '#f91880' : 'currentColor'} /> {likeCount}
            </button>
            <button type="button" className="action-btn-item">
              <Share2 size={15} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'facebook' && (
        <div className="mock-card mock-facebook">
          <div className="fb-header">
            <div className="fb-avatar">ES</div>
            <div className="fb-user-details">
              <span className="fb-username">Eshaan Sharma</span>
              <span className="fb-time">Just now · 🌐 Public</span>
            </div>
            <MoreHorizontal size={18} style={{ marginLeft: 'auto', color: '#65676b' }} />
          </div>
          <div className="fb-body">
            {content || <span style={{ color: '#65676b', fontStyle: 'italic' }}>What's on your mind? (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('facebook')}
          <div className="fb-stats-row">
            <span style={{ fontSize: '0.78rem', color: '#65676b' }}>👍❤️ {likeCount} Reactions</span>
            <span style={{ fontSize: '0.78rem', color: '#65676b' }}>14 Comments · 8 Shares</span>
          </div>
          <div className="fb-actions">
            <button type="button" className={`fb-action-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike}>
              <ThumbsUp size={16} /> Like
            </button>
            <button type="button" className="fb-action-btn">
              <MessageCircle size={16} /> Comment
            </button>
            <button type="button" className="fb-action-btn">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      )}

      {activeTab === 'instagram' && (
        <div className="mock-card mock-instagram">
          <div className="ig-header">
            <div className="ig-avatar">
              <div className="ig-avatar-inner" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="ig-username">eshaan_sharma</span>
              <span style={{ fontSize: '0.68rem', color: '#8e8e8e' }}>Original Audio</span>
            </div>
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
            <Heart size={20} fill={isLiked ? '#ed4956' : 'none'} color={isLiked ? '#ed4956' : 'currentColor'} onClick={toggleLike} style={{ cursor: 'pointer' }} />
            <MessageCircle size={20} style={{ cursor: 'pointer' }} />
            <Send size={20} style={{ cursor: 'pointer' }} />
            <Bookmark size={20} style={{ marginLeft: 'auto', cursor: 'pointer' }} />
          </div>
          
          <div className="ig-likes">
            Liked by <strong>alex_dev</strong> and <strong>{likeCount.toLocaleString()} others</strong>
          </div>

          <div className="ig-caption-box">
            <span className="ig-caption-user">eshaan_sharma</span>
            <span className="ig-caption-text">
              {content || <span style={{ color: '#8e8e8e', fontStyle: 'italic' }}>Draft content will appear here</span>}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'linkedin' && (
        <div className="mock-card mock-linkedin">
          <div className="li-header">
            <div className="li-avatar">ES</div>
            <div className="li-user-details">
              <span className="li-username">Eshaan Sharma</span>
              <span className="li-headline">Full Stack Developer & Founder</span>
              <span className="li-time">1h · 🌐</span>
            </div>
            <button type="button" className="li-follow-btn">+ Follow</button>
          </div>
          <div className="li-body">
            {content || <span style={{ color: 'rgba(0,0,0,0.6)', fontStyle: 'italic' }}>What do you want to talk about? (Draft content will appear here)</span>}
          </div>
          {renderMediaGrid('linkedin')}
          <div className="li-reactions-count">
            👏❤️💡 {likeCount} engagements
          </div>
          <div className="li-actions">
            <button type="button" className={`li-action-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike}>
              <ThumbsUp size={16} /> Like
            </button>
            <button type="button" className="li-action-btn">
              <MessageCircle size={16} /> Comment
            </button>
            <button type="button" className="li-action-btn">
              <Share2 size={16} /> Repost
            </button>
            <button type="button" className="li-action-btn">
              <Send size={16} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Preview);
