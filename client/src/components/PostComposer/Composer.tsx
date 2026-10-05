import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  Lightbulb,
  Share2,
  FileText,
  Wand2,
  Calendar,
  PenSquare,
  Smile,
  Hash,
  Sliders,
  ChevronDown,
  Upload,
  Plus,
  X,
  ArrowRight,
  Save,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  MoreHorizontal,
  Clock,
  Layers,
  Pencil,
  Info,
} from 'lucide-react';
import {
  clearComposer,
  deleteLocalDraft,
  fetchPublishedPosts,
  loadDraftIntoComposer,
  loadLocalDrafts,
  publishCurrentPost,
  saveLocalDraft,
  addScheduledPost,
  selectActiveLocalDraft,
  selectComposer,
  selectLocalDraftLoadingId,
  selectLocalDrafts,
  selectLocalDraftStatus,
  selectPublishedPosts,
  selectPublishStatus,
  setComposerField,
} from '../../store/postsSlice';
import type { AppDispatch } from '../../store/store';
import {
  selectPlatformRules,
  selectSelectedPlatformIds,
  setSelectedPlatforms,
  togglePlatform,
} from '../../store/platformsSlice';
import { selectAuthToken } from '../../store/authSlice';
import type { PlatformId, PostDraft, ValidationData } from '../../types';
import './PostComposerStudio.css';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

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

const sampleGalleryImages = [
  { name: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop' },
  { name: 'Creative Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop' },
  { name: 'Executive Meeting', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop' },
  { name: 'Coffee & Concept', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop' },
];

const studioTemplates = [
  {
    emoji: '🚀',
    name: 'Product Launch',
    title: '🚀 Major Product Update v2.0 Released!',
    copy: 'Exciting news! We just shipped version 2.0 of Social Composer. Faster workflow, multi-role RBAC, and real-time live preview studio! Check it out now. 👇\n\n#BuildInPublic #TechLaunch #React #WebDev',
    media: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop'],
  },
  {
    emoji: '🔥',
    name: 'Hype Feature',
    title: '🔥 New Role-Based Access Control Is Live',
    copy: 'Security first! 🔐 Admins can manage permissions, Editors can compose & publish, and Viewers get read-only access. Full RBAC demo inside our dashboard.\n\n#Security #FullStack #SpringBoot #DevCommunity',
    media: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop'],
  },
  {
    emoji: '💡',
    name: 'Pro Tip',
    title: '💡 Quick Tip for Social Growth',
    copy: 'Consistent multi-channel publishing increases post reach by over 3x! 📈 Use our social composer to craft tailored copy for Twitter, Facebook, Instagram & LinkedIn in one go.\n\n#Growth #SocialMedia #MarketingTips',
    media: [],
  },
  {
    emoji: '📣',
    name: 'Announcement',
    title: '📣 Upcoming Scheduled Maintenance & Features',
    copy: 'We are rolling out scheduled post support and high-performance temporal calendar views this weekend. Seamless publishing across your favorite platforms!\n\n#Announcements #ProductUpdate #SaaS',
    media: [],
  },
  {
    emoji: '📸',
    name: 'Behind the Scenes',
    title: '📸 Behind The Scenes with the Engineering Team',
    copy: 'Here is a sneak peek into how our engineering team redesigned the entire Social Composer Studio in record time. Clean architecture, modern SaaS design, zero bloat.\n\n#TeamWork #Engineering #BehindTheScenes',
    media: ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop'],
  },
  {
    emoji: '📊',
    name: 'Industry Update',
    title: '📊 State of Multi-Channel Social Marketing',
    copy: 'Recent industry audits show that teams publishing with integrated JWT + RBAC platforms experience 40% higher productivity and zero unauthorized leaks.\n\n#IndustryTrends #DataInsights #SocialMediaTech',
    media: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop'],
  },
];

const commonHashtags = ['#Launch', '#Growth', '#Design', '#WebDev', '#Social', '#AI', '#Tech', '#Startup'];

interface ToastState {
  message: string;
  isError: boolean;
}

export default function Composer() {
  const dispatch = useDispatch<AppDispatch>();
  const composer = useSelector(selectComposer);
  const localDrafts = useSelector(selectLocalDrafts);
  const history = useSelector(selectPublishedPosts);
  const selectedPlatforms = useSelector(selectSelectedPlatformIds);
  const platformRules = useSelector(selectPlatformRules);
  const authToken = useSelector(selectAuthToken);
  const activeDraft = useSelector(selectActiveLocalDraft);
  const draftLoadingId = useSelector(selectLocalDraftLoadingId);
  const localDraftStatus = useSelector(selectLocalDraftStatus);
  const publishStatus = useSelector(selectPublishStatus);
  const { title, content, mediaUrls, activeDraftId } = composer;

  const [validationData, setValidationData] = useState<ValidationData>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<PlatformId>('twitter');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'hype' | 'professional' | 'casual' | 'inspiring'>('hype');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDraftSaving = localDraftStatus === 'saving';
  const isPublishing = publishStatus === 'loading';

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    dispatch(fetchPublishedPosts());
    dispatch(loadLocalDrafts())
      .unwrap()
      .catch((msg) => showToast(typeof msg === 'string' ? msg : 'Error loading drafts', true));
  }, [dispatch, showToast]);

  // Keep preview tab in sync with selected platforms
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activePreviewPlatform)) {
      setActivePreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activePreviewPlatform]);

  const setTitle = useCallback((value: string) => {
    dispatch(setComposerField({ field: 'title', value }));
  }, [dispatch]);

  const setContent = useCallback((value: string) => {
    dispatch(setComposerField({ field: 'content', value }));
  }, [dispatch]);

  const setMediaUrls = useCallback((value: string[]) => {
    dispatch(setComposerField({ field: 'mediaUrls', value }));
  }, [dispatch]);

  // Fallback client validation
  const runFallbackValidation = useCallback(() => {
    const fallbackResults: ValidationData = {};
    selectedPlatforms.forEach((platform) => {
      const rule = platformRules[platform];
      const errors: string[] = [];
      const warnings: string[] = [];
      const count = content ? content.length : 0;
      if (!rule) return;

      if (count > rule.maxChars) {
        errors.push(`Character count (${count}) exceeds the limit of ${rule.maxChars} for ${rule.name}.`);
      }
      if (mediaUrls.length > rule.maxMedia) {
        errors.push(`Media count (${mediaUrls.length}) exceeds the limit of ${rule.maxMedia} for ${rule.name}.`);
      }
      if (rule.mediaRequired && mediaUrls.length === 0) {
        errors.push(`At least one image or video is required to post on ${rule.name}.`);
      }
      fallbackResults[platform] = {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    });
    setValidationData(fallbackResults);
  }, [content, mediaUrls.length, platformRules, selectedPlatforms]);

  // Real-time validation
  useEffect(() => {
    if (selectedPlatforms.length === 0) {
      setValidationData({});
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
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
          runFallbackValidation();
        }
      } catch {
        runFallbackValidation();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [authToken, content, mediaUrls.length, selectedPlatforms, runFallbackValidation]);

  // Character limit calculations
  const strictestCharLimit = useMemo(() => {
    if (selectedPlatforms.length === 0) return 280;
    return selectedPlatforms.reduce(
      (min, platform) => Math.min(min, characterLimits[platform]),
      Infinity
    );
  }, [selectedPlatforms]);

  const charCount = content ? content.length : 0;
  const isOverLimit = strictestCharLimit !== Infinity && charCount > strictestCharLimit;
  const isCloseToLimit = strictestCharLimit !== Infinity && charCount > strictestCharLimit - 30;

  // Actions
  const handleSaveLocalDraft = useCallback(async () => {
    try {
      const result = await dispatch(saveLocalDraft()).unwrap();
      showToast(result.isUpdate ? 'Local draft updated in browser storage.' : 'Local draft saved in browser storage.');
    } catch (msg) {
      showToast(typeof msg === 'string' ? msg : 'Failed to save draft.', true);
    }
  }, [dispatch, showToast]);

  const handleLoadDraft = useCallback(async (draft: PostDraft) => {
    try {
      const loaded = await dispatch(loadDraftIntoComposer(draft.id)).unwrap();
      dispatch(setSelectedPlatforms(loaded.platforms));
      setIsDraftsModalOpen(false);
      showToast('Draft loaded into workspace.');
    } catch (msg) {
      showToast(typeof msg === 'string' ? msg : 'Error loading draft.', true);
    }
  }, [dispatch, showToast]);

  const handleDeleteDraft = useCallback(async (id: string) => {
    try {
      await dispatch(deleteLocalDraft(id)).unwrap();
      showToast('Draft deleted.');
    } catch (msg) {
      showToast(typeof msg === 'string' ? msg : 'Failed to delete draft.', true);
    }
  }, [dispatch, showToast]);

  const handleClear = useCallback(() => {
    dispatch(clearComposer());
    setScheduledDateTime('');
    showToast('Composer workspace cleared.');
  }, [dispatch, showToast]);

  const handlePublishOrSchedule = useCallback(async () => {
    if (selectedPlatforms.length === 0) {
      showToast('Please select at least one social platform.', true);
      return;
    }

    if (isOverLimit) {
      showToast(`Content exceeds character limit of ${strictestCharLimit}.`, true);
      return;
    }

    // If user provided a schedule date/time
    if (scheduledDateTime) {
      const [datePart, timePart] = scheduledDateTime.split('T');
      dispatch(
        addScheduledPost({
          title: title || 'Scheduled Post',
          content,
          mediaUrls,
          platforms: selectedPlatforms,
          scheduledDate: datePart,
          scheduledTime: timePart || '12:00',
          status: 'scheduled',
        })
      );
      showToast(`Post successfully scheduled for ${datePart} at ${timePart || '12:00'}!`);
      dispatch(clearComposer());
      setScheduledDateTime('');
      return;
    }

    try {
      await dispatch(publishCurrentPost()).unwrap();
      showToast('Post successfully published to database registry!');
    } catch (msg) {
      showToast(typeof msg === 'string' ? msg : 'Failed to publish post.', true);
    }
  }, [
    content,
    dispatch,
    isOverLimit,
    mediaUrls,
    scheduledDateTime,
    selectedPlatforms,
    showToast,
    strictestCharLimit,
    title,
  ]);

  // Quick Starter Templates
  const handleApplyTemplate = (tmpl: typeof studioTemplates[0]) => {
    setTitle(tmpl.title);
    setContent(tmpl.copy);
    if (tmpl.media.length > 0) {
      setMediaUrls(tmpl.media);
    }
    showToast(`Template "${tmpl.name}" loaded.`);
  };

  // Creative Tools
  const handleAddEmoji = () => {
    const emojis = ['🚀', '⚡', '🔥', '💡', '✨', '🎯', '🙌', '🌟'];
    const pick = emojis[Math.floor(Math.random() * emojis.length)];
    setContent(`${content ? content + ' ' : ''}${pick}`);
  };

  const handleCycleTone = () => {
    const tones: Array<'hype' | 'professional' | 'casual' | 'inspiring'> = [
      'hype',
      'professional',
      'casual',
      'inspiring',
    ];
    const nextIndex = (tones.indexOf(selectedTone) + 1) % tones.length;
    const nextTone = tones[nextIndex];
    setSelectedTone(nextTone);
    showToast(`Writing tone set to: ${nextTone.toUpperCase()}`);
  };

  const handleAppendHashtags = () => {
    const defaultTags = ['#SocialComposer', '#TechLaunch', '#SaaS', '#Growth'];
    const appended = defaultTags.filter((t) => !content.includes(t)).join(' ');
    if (appended) {
      const separator = content.endsWith(' ') || content.length === 0 ? '' : ' ';
      setContent(content + separator + appended);
    }
  };

  const handleSmartAiAssist = (actionType: string) => {
    setIsAiDropdownOpen(false);
    if (!content.trim()) {
      setContent(
        '🚀 Exciting announcement: We are launching our modern multi-channel social composer! Supercharged with JWT security & live simulation previews. #Launch #SaaS'
      );
      showToast('AI Post generated.');
      return;
    }

    if (actionType === 'shorten') {
      const sentences = content.split('.').filter(Boolean);
      if (sentences.length > 1) {
        setContent(sentences[0].trim() + '.');
      }
      showToast('Condensed content.');
    } else if (actionType === 'cta') {
      setContent(content + '\n\n👉 Try it today and share your feedback below!');
      showToast('Added Call to Action.');
    } else if (actionType === 'engaging') {
      setContent(`🔥 Quick question for the community:\n\n${content}\n\nWhat do you think? Drop a comment! 👇`);
      showToast('Enhanced post engagement.');
    } else if (actionType === 'hashtags') {
      handleAppendHashtags();
      showToast('Added contextual hashtags.');
    } else {
      setContent(`✨ ${content.trim()}`);
      showToast('Content refined with AI.');
    }
  };

  // Media upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const url = uploadEvent.target?.result as string;
      if (url) {
        setMediaUrls([...mediaUrls, url]);
        showToast('Media attachment added.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleAddSampleImage = (url: string) => {
    setMediaUrls([...mediaUrls, url]);
    setIsMediaGalleryOpen(false);
    showToast('Gallery image attached.');
  };

  return (
    <div className="studio-page-container">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`toast ${toast.isError ? 'error' : ''}`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: toast.isError ? '#fee2e2' : '#e8f8f0',
            color: toast.isError ? '#dc2626' : '#087a4b',
            border: `1px solid ${toast.isError ? '#fca5a5' : '#c8ecd9'}`,
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            fontWeight: 700,
            fontSize: '0.86rem',
          }}
        >
          {toast.isError ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 1. PAGE HEADER ── */}
      <header className="studio-header">
        <div className="studio-header-left">
          <div className="studio-header-icon-box">
            <PenSquare size={24} />
          </div>
          <div>
            <h1 className="studio-header-title">Post Composer</h1>
            <p className="studio-header-sub">
              Create, customize and publish engaging content across multiple social platforms.
            </p>
          </div>
        </div>

        <div className="studio-header-utilities">
          {/* Smart Templates Utility Card */}
          <div
            className="studio-utility-card"
            onClick={() => handleApplyTemplate(studioTemplates[0])}
            title="Smart Starter Templates"
          >
            <div className="utility-icon-circle amber">
              <Lightbulb size={18} />
            </div>
            <div className="utility-card-texts">
              <span className="utility-card-title">Smart Templates</span>
              <span className="utility-card-desc">Use pre-built templates for faster posting</span>
            </div>
          </div>

          {/* Drafts Manager Drawer Trigger */}
          <div
            className="studio-utility-card"
            onClick={() => setIsDraftsModalOpen(true)}
            title="Saved Drafts"
          >
            <div className="utility-icon-circle green">
              <Save size={18} />
            </div>
            <div className="utility-card-texts">
              <span className="utility-card-title">Drafts ({localDrafts.length})</span>
              <span className="utility-card-desc">Browse local drafts</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. THREE-COLUMN WORKSPACE GRID ── */}
      <div className="studio-workspace-grid">
        {/* ── LEFT COLUMN: PLATFORMS, TEMPLATES, TOOLS, SCHEDULING ── */}
        <div className="studio-column-left">
          {/* Social Platforms Selector */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <Share2 size={16} color="#12a765" /> Social Platforms
                </span>
                <span className="studio-card-subtitle">
                  Select where you want to publish this post.
                </span>
              </div>
            </div>

            <div className="studio-platforms-grid">
              {(
                [
                  { id: 'twitter', label: 'X (Twitter)', iconText: '𝕏' },
                  { id: 'facebook', label: 'Facebook', iconText: 'fb' },
                  { id: 'instagram', label: 'Instagram', iconText: '📸' },
                  { id: 'linkedin', label: 'LinkedIn', iconText: 'in' },
                ] as const
              ).map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`studio-platform-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => dispatch(togglePlatform(p.id))}
                  >
                    <div className="platform-pill-icon-box">
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{p.iconText}</span>
                    </div>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post Templates */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <FileText size={16} color="#12a765" /> Post Templates
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate(studioTemplates[0])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#12a765',
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                View All →
              </button>
            </div>

            <div className="studio-templates-grid">
              {studioTemplates.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  className="studio-template-btn"
                  onClick={() => handleApplyTemplate(tmpl)}
                  title={tmpl.title}
                >
                  <span className="template-btn-emoji">{tmpl.emoji}</span>
                  <span className="template-btn-name">{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Creative Tools */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <Wand2 size={16} color="#12a765" /> Creative Tools
                </span>
              </div>
            </div>

            <div className="studio-tools-grid">
              <button
                type="button"
                className="studio-tool-btn"
                onClick={handleAddEmoji}
                title="Add Emojis"
              >
                <div className="tool-btn-icon-wrap">
                  <Smile size={16} />
                </div>
                <div className="tool-btn-texts">
                  <span className="tool-btn-title">Add Emojis</span>
                  <span className="tool-btn-sub">Quick emoji picker</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-tool-btn"
                onClick={handleCycleTone}
                title={`Current Tone: ${selectedTone.toUpperCase()}`}
              >
                <div className="tool-btn-icon-wrap">
                  <Sliders size={16} />
                </div>
                <div className="tool-btn-texts">
                  <span className="tool-btn-title">Tone</span>
                  <span className="tool-btn-sub" style={{ textTransform: 'capitalize' }}>
                    {selectedTone}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="studio-tool-btn"
                onClick={() => handleSmartAiAssist('rewrite')}
                title="Rewrite with AI"
              >
                <div className="tool-btn-icon-wrap">
                  <Sparkles size={16} />
                </div>
                <div className="tool-btn-texts">
                  <span className="tool-btn-title">Rewrite AI</span>
                  <span className="tool-btn-sub">Improve content</span>
                </div>
              </button>

              <button
                type="button"
                className="studio-tool-btn"
                onClick={handleAppendHashtags}
                title="Hashtag Suggestions"
              >
                <div className="tool-btn-icon-wrap">
                  <Hash size={16} />
                </div>
                <div className="tool-btn-texts">
                  <span className="tool-btn-title">Hashtags</span>
                  <span className="tool-btn-sub">Get suggestions</span>
                </div>
              </button>
            </div>
          </div>

          {/* Scheduling */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <Calendar size={16} color="#12a765" /> Scheduling
                </span>
                <span className="studio-card-subtitle">
                  Schedule for later (Optional)
                </span>
              </div>
            </div>

            <div className="studio-schedule-input-wrap">
              <Clock size={16} color="#12a765" />
              <input
                type="datetime-local"
                className="studio-schedule-input"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                placeholder="Select date & time"
              />
            </div>
          </div>
        </div>

        {/* ── CENTER COLUMN: POST CONTENT & MEDIA & ACTIONS ── */}
        <div className="studio-column-center">
          {/* Main Content Card */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <PenSquare size={16} color="#12a765" /> Post Content
                </span>
              </div>

              {/* AI Generate Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="studio-ai-btn"
                  onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
                >
                  <Sparkles size={14} />
                  <span>AI Generate</span>
                  <ChevronDown size={14} />
                </button>

                {isAiDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      zIndex: 80,
                      background: '#ffffff',
                      border: '1px solid #dde7e2',
                      borderRadius: '10px',
                      padding: '0.4rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      minWidth: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    {[
                      { type: 'hook', label: '✦ Catchy Hook' },
                      { type: 'shorten', label: '✂ Make Shorter' },
                      { type: 'engaging', label: '🔥 More Engaging' },
                      { type: 'cta', label: '👆 Add Call-to-Action' },
                      { type: 'hashtags', label: '# Generate Hashtags' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 650,
                          color: '#101817',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3fbf7';
                          e.currentTarget.style.color = '#12a765';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#101817';
                        }}
                        onClick={() => handleSmartAiAssist(item.type)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Post Title & Textarea */}
            <div className="studio-textarea-wrap">
              <input
                type="text"
                className="studio-title-input"
                placeholder="Post title (e.g. 🚀 Major Product Release)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="studio-textarea"
                placeholder="What's on your mind? Create something amazing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Character Limit Indicator */}
              <div className="studio-char-bar-wrap">
                <span
                  className={`studio-char-count-text ${
                    isOverLimit ? 'over' : isCloseToLimit ? 'warn' : ''
                  }`}
                >
                  {charCount} / {strictestCharLimit.toLocaleString()} chars
                  {isOverLimit && ' (Limit exceeded)'}
                </span>

                {strictestCharLimit !== Infinity && (
                  <div
                    style={{
                      width: '120px',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#edf2ef',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (charCount / strictestCharLimit) * 100)}%`,
                        height: '100%',
                        background: isOverLimit ? '#dc2626' : isCloseToLimit ? '#d97706' : '#12a765',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Editor Toolbar */}
              <div className="studio-editor-toolbar">
                <div className="toolbar-format-group">
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Bold"
                    onClick={() => setContent(content ? `**${content}**` : '**Bold Text**')}
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Italic"
                    onClick={() => setContent(content ? `*${content}*` : '*Italic Text*')}
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Underline"
                    onClick={() => setContent(content ? `<u>${content}</u>` : '<u>Underlined</u>')}
                  >
                    <Underline size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Bullet List"
                    onClick={() => setContent(`${content}\n• Point 1\n• Point 2`)}
                  >
                    <List size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Numbered List"
                    onClick={() => setContent(`${content}\n1. First\n2. Second`)}
                  >
                    <ListOrdered size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Add Emoji"
                    onClick={handleAddEmoji}
                  >
                    <Smile size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Attach Image"
                    onClick={() => setIsMediaGalleryOpen(true)}
                  >
                    <ImageIcon size={15} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn"
                    title="Add Link"
                    onClick={() => setContent(content + ' https://socialcomposer.app')}
                  >
                    <Link2 size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  className="toolbar-hashtag-chip"
                  onClick={handleAppendHashtags}
                >
                  <Hash size={13} /> Add Hashtags
                </button>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <ImageIcon size={16} color="#12a765" /> Media{' '}
                  <span style={{ fontSize: '0.74rem', color: '#8c9b94', fontWeight: 600 }}>
                    (Optional)
                  </span>
                </span>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div
              className="studio-media-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const reader = new FileReader();
                  reader.onload = (uploadEvent) => {
                    const url = uploadEvent.target?.result as string;
                    if (url) {
                      setMediaUrls([...mediaUrls, url]);
                      showToast('Dropped image attached.');
                    }
                  };
                  reader.readAsDataURL(files[0]);
                }
              }}
            >
              <div className="dropzone-icon-box">
                <ImageIcon size={22} />
              </div>
              <div>
                <span className="dropzone-text-main">
                  Drag & drop images, videos or GIFs
                </span>
                <p className="dropzone-text-sub">PNG, JPG, GIF, MP4 (Max 10MB)</p>
              </div>
              <button
                type="button"
                className="studio-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload Media
              </button>
            </div>

            {/* Attached Thumbnails */}
            {mediaUrls.length > 0 && (
              <div className="studio-media-grid">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="studio-media-thumb-box">
                    <img src={url} alt={`attachment-${idx}`} />
                    <button
                      type="button"
                      className="studio-media-remove-btn"
                      onClick={() => handleRemoveMedia(idx)}
                      title="Remove attachment"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="studio-media-add-slot"
                  onClick={() => setIsMediaGalleryOpen(true)}
                  title="Add more media from sample gallery"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="studio-actions-bar">
            <button
              type="button"
              className="btn-studio-draft"
              onClick={handleSaveLocalDraft}
              disabled={isDraftSaving}
              title="Save unfinished post locally"
            >
              <Save size={16} />
              <span>{isDraftSaving ? 'Saving...' : 'Save as Draft'}</span>
            </button>

            <button
              type="button"
              className="btn-studio-clear"
              onClick={handleClear}
              title="Clear all fields"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>

            <button
              type="button"
              className="btn-studio-publish"
              onClick={handlePublishOrSchedule}
              disabled={isPublishing}
            >
              <span>
                {scheduledDateTime
                  ? 'Schedule Post →'
                  : isPublishing
                  ? 'Publishing...'
                  : 'Preview & Publish →'}
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LIVE PREVIEW SIMULATOR ── */}
        <div className="studio-column-right">
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <span className="studio-card-title">
                  <Eye size={16} color="#12a765" /> Live Preview
                </span>
                <span className="studio-card-subtitle">
                  See how your post will look on each platform.
                </span>
              </div>
            </div>

            {/* Platform Preview Tabs */}
            <div className="preview-platform-tabs">
              {(
                [
                  { id: 'twitter', label: 'X (Twitter)' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'linkedin', label: 'LinkedIn' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`preview-tab-pill ${
                    activePreviewPlatform === tab.id ? 'active' : ''
                  }`}
                  onClick={() => setActivePreviewPlatform(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Realistic Social Simulation Card */}
            <div className="social-sim-card">
              <div className="sim-author-row">
                <div className="sim-author-meta">
                  <div className="sim-avatar-circle">SC</div>
                  <div className="sim-author-names">
                    <span className="sim-display-name">Social Composer</span>
                    <span className="sim-handle-time">@socialcomposer · now</span>
                  </div>
                </div>
                <MoreHorizontal size={18} color="#8c9b94" style={{ cursor: 'pointer' }} />
              </div>

              {/* Dynamic Post Body */}
              <div className="sim-post-body">
                {content || (
                  <span style={{ color: '#8c9b94', fontStyle: 'italic' }}>
                    What&apos;s on your mind? Create something amazing...
                  </span>
                )}
              </div>

              {/* Attached Media / Placeholder Preview */}
              <div className="sim-media-box">
                {mediaUrls.length > 0 ? (
                  <img src={mediaUrls[0]} alt="Post preview attachment" />
                ) : (
                  <div className="sim-media-placeholder">
                    <ImageIcon size={32} opacity={0.4} />
                  </div>
                )}
              </div>

              {/* Dynamic Engagement Controls */}
              <div className="sim-engagement-row">
                <div className="sim-engage-item">
                  <MessageCircle size={15} />
                  <span>12</span>
                </div>
                <div className="sim-engage-item">
                  <Repeat2 size={15} />
                  <span>28</span>
                </div>
                <div className="sim-engage-item">
                  <Heart size={15} />
                  <span>142</span>
                </div>
                <div className="sim-engage-item">
                  <BarChart2 size={15} />
                </div>
                <div className="sim-engage-item">
                  <Bookmark size={15} />
                </div>
              </div>
            </div>

            {/* Subtle Disclaimer Note */}
            <div className="sim-disclaimer">
              <Info size={13} color="#8c9b94" />
              <span>Previews are approximate and may vary slightly across platforms.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM FULL-WIDTH: CONTENT SUGGESTIONS ── */}
      <section className="studio-suggestions-section">
        <div className="suggestions-header">
          <div className="suggestions-title-group">
            <Sparkles size={18} color="#12a765" />
            <div>
              <h3 className="suggestions-title">Content Suggestions</h3>
              <p className="suggestions-sub">
                Get AI-powered suggestions to make your post more engaging.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-refresh-suggestions"
            onClick={() => handleSmartAiAssist('rewrite')}
          >
            ↻ Refresh Suggestions
          </button>
        </div>

        <div className="suggestions-cards-grid">
          <div
            className="suggestion-card-item"
            onClick={() => handleSmartAiAssist('shorten')}
            title="Condense your content"
          >
            <div className="suggestion-icon-circle">✂️</div>
            <div className="suggestion-texts">
              <span className="suggestion-title">Make it shorter</span>
              <span className="suggestion-desc">Condense your content</span>
            </div>
          </div>

          <div
            className="suggestion-card-item"
            onClick={() => handleSmartAiAssist('cta')}
            title="Add engagement call to action"
          >
            <div className="suggestion-icon-circle">👆</div>
            <div className="suggestion-texts">
              <span className="suggestion-title">Add a call to action</span>
              <span className="suggestion-desc">Increase engagement</span>
            </div>
          </div>

          <div
            className="suggestion-card-item"
            onClick={() => handleSmartAiAssist('engaging')}
            title="Make copy compelling"
          >
            <div className="suggestion-icon-circle">📈</div>
            <div className="suggestion-texts">
              <span className="suggestion-title">Make it more engaging</span>
              <span className="suggestion-desc">Add compelling elements</span>
            </div>
          </div>

          <div
            className="suggestion-card-item"
            onClick={handleCycleTone}
            title="Adjust tone for your audience"
          >
            <div className="suggestion-icon-circle">🎛️</div>
            <div className="suggestion-texts">
              <span className="suggestion-title">Improve the tone</span>
              <span className="suggestion-desc">Adjust for your audience</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL: SAMPLE GALLERY IMAGES ── */}
      {isMediaGalleryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 24, 23, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsMediaGalleryOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101817' }}>
                Select Image Attachment
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaGalleryOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#66736e',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#66736e', marginBottom: '1.25rem' }}>
              Select high-resolution royalty-free imagery or upload your own file.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {sampleGalleryImages.map((img) => (
                <div
                  key={img.name}
                  onClick={() => handleAddSampleImage(img.url)}
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #dde7e2',
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      padding: '0.45rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#101817',
                      textAlign: 'center',
                    }}
                  >
                    + {img.name}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-studio-publish"
              style={{ width: '100%' }}
              onClick={() => {
                setIsMediaGalleryOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload size={16} /> Upload From Your Computer
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: SAVED DRAFTS MANAGER ── */}
      {isDraftsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 24, 23, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsDraftsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101817' }}>
                Saved Local Drafts ({localDrafts.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#66736e',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {localDrafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#66736e' }}>
                <p>No local drafts saved yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  Use &quot;Save as Draft&quot; to save work in progress.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {localDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    style={{
                      border: '1px solid #dde7e2',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: draft.id === activeDraftId ? '#e8f8f0' : '#f7faf8',
                    }}
                  >
                    <div style={{ maxWidth: '70%' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#101817', display: 'block' }}>
                        {draft.title || 'Untitled Draft'}
                      </strong>
                      <p
                        style={{
                          fontSize: '0.76rem',
                          color: '#66736e',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '0.2rem',
                        }}
                      >
                        {draft.content || 'No text content'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-studio-draft"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => handleLoadDraft(draft)}
                        disabled={draftLoadingId === draft.id}
                      >
                        <Pencil size={13} /> Load
                      </button>
                      <button
                        type="button"
                        className="btn-studio-clear"
                        style={{ padding: '0.4rem 0.65rem' }}
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
