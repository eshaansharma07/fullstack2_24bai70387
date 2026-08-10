export type PlatformId = 'twitter' | 'facebook' | 'instagram' | 'linkedin';
export type UserRole = 'admin' | 'editor' | 'viewer';

export type LoadStatus = 'idle' | 'loading' | 'saving' | 'succeeded' | 'failed';
export type PublishStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated' | 'failed';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

export interface PlatformRule {
  id: PlatformId;
  name: string;
  maxChars: number;
  maxMedia: number;
  mediaRequired: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type ValidationData = Partial<Record<PlatformId, ValidationResult>>;

export interface PostDraft {
  id: string;
  _id?: string;
  title: string;
  content: string;
  mediaUrls: string[];
  platforms: PlatformId[];
  createdAt: string;
  updatedAt: string;
}

export interface PublishedPost {
  id: string;
  _id?: string;
  title: string;
  content: string;
  mediaCount: number;
  mediaUrls: string[];
  platforms: PlatformId[];
  createdAt: string;
}

export interface ComposerState {
  title: string;
  content: string;
  mediaUrls: string[];
  activeDraftId: string | null;
}

export interface EntityState<T extends { id: string }> {
  ids: string[];
  entities: Record<string, T>;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  platforms: PlatformId[];
  scheduledDate: string; // ISO format YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: 'scheduled' | 'published';
  createdAt: string;
}

export interface PostsState {
  composer: ComposerState;
  localDrafts: EntityState<PostDraft> & {
    status: LoadStatus;
    loadingId: string | null;
    error: string | null;
  };
  publishedPosts: EntityState<PublishedPost> & {
    status: Exclude<LoadStatus, 'saving'>;
    error: string | null;
  };
  scheduledPosts: EntityState<ScheduledPost>;
  publishStatus: PublishStatus;
}

export interface PlatformsState {
  ids: PlatformId[];
  selectedIds: PlatformId[];
  entities: Record<PlatformId, PlatformRule>;
}

