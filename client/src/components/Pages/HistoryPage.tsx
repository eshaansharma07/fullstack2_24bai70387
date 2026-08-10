import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database, Calendar, Image as ImageIcon, Eye, Trash2, X } from 'lucide-react';
import { fetchPublishedPosts, selectPublishedPosts } from '../../store/postsSlice';
import { selectAuthUser, selectAuthToken } from '../../store/authSlice';
import Preview from '../PostComposer/Preview';
import type { AppDispatch } from '../../store/store';
import type { PublishedPost } from '../../types';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

export default function HistoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector(selectPublishedPosts);
  const user = useSelector(selectAuthUser);
  const authToken = useSelector(selectAuthToken);
  const [activeModalPost, setActiveModalPost] = useState<PublishedPost | null>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchPublishedPosts());
  }, [dispatch]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        dispatch(fetchPublishedPosts());
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="page-header">
        <h1><Database size={28} /> Published Posts</h1>
        <p>Posts saved to MongoDB Atlas database. {isAdmin ? 'As admin, you can delete posts.' : ''}</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <Database size={48} />
          <strong>No published posts yet</strong>
          <span>Posts published via the composer will appear here.</span>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((post) => (
            <div key={post._id || post.id} className="history-card">
              <div className="history-meta">
                <span className="history-date">
                  <Calendar size={10} style={{ marginRight: '0.25rem', display: 'inline' }} />
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <div className="history-platforms">
                  {post.platforms.map((plat) => (
                    <span key={plat} className={`history-platform-dot ${plat}`} title={plat} />
                  ))}
                </div>
              </div>
              <h4 className="history-post-title">{post.title}</h4>
              <p className="history-post-content">{post.content}</p>
              <div className="history-post-media-count">
                <ImageIcon size={14} />
                {post.mediaCount} attached media asset{post.mediaCount !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}
                  onClick={() => setActiveModalPost(post)}
                >
                  <Eye size={14} /> View Feed
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn-secondary icon-action danger"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                    onClick={() => handleDelete(post._id || post.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModalPost && (
        <div className="modal-overlay" onClick={() => setActiveModalPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setActiveModalPost(null)}>
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
