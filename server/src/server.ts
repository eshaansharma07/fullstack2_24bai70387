import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { getPosts, savePost } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

type PlatformId = 'twitter' | 'facebook' | 'instagram' | 'linkedin';

interface PlatformRule {
  name: string;
  maxChars: number;
  maxMedia: number;
  mediaRequired: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidateBody {
  content?: string;
  mediaCount?: number;
  platforms?: string[];
}

interface SaveBody extends ValidateBody {
  title?: string;
  mediaUrls?: string[];
}

interface AuthLoginBody {
  email?: string;
  password?: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

interface JwtPayload extends AuthUser {
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

const DEMO_USER: AuthUser = {
  id: 'usr_demo_social_composer',
  email: process.env.AUTH_EMAIL || 'student@example.com',
  name: process.env.AUTH_NAME || 'Student User',
  role: 'student',
};

const DEMO_PASSWORD = process.env.AUTH_PASSWORD || 'password123';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-social-composer-secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 2;

const PLATFORM_RULES: Record<PlatformId, PlatformRule> = {
  twitter: {
    name: 'X (Twitter)',
    maxChars: 280,
    maxMedia: 4,
    mediaRequired: false,
  },
  facebook: {
    name: 'Facebook',
    maxChars: 63206,
    maxMedia: 10,
    mediaRequired: false,
  },
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    maxMedia: 10,
    mediaRequired: true,
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    maxMedia: 9,
    mediaRequired: false,
  }
};

function isPlatformId(platform: string): platform is PlatformId {
  return platform in PLATFORM_RULES;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function signJwt(payload: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

function verifyJwt(token: string): JwtPayload | null {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = base64UrlEncode(
    crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest()
  );

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  const payload = verifyJwt(token);

  if (!payload) {
    return res.status(401).json({ error: 'Authentication token is invalid or expired.' });
  }

  req.authUser = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
  next();
}

function validatePostForPlatform(platform: string, content = '', mediaCount = 0): ValidationResult {
  if (!isPlatformId(platform)) {
    return { isValid: false, errors: ['Unknown platform selected'], warnings: [] };
  }

  const rules = PLATFORM_RULES[platform];
  if (!rules) {
    return { isValid: false, errors: ['Unknown platform selected'], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  const charCount = content ? content.length : 0;

  if (charCount > rules.maxChars) {
    errors.push(`Character count (${charCount.toLocaleString()}) exceeds the limit of ${rules.maxChars.toLocaleString()} for ${rules.name}.`);
  }

  if (mediaCount > rules.maxMedia) {
    errors.push(`Media count (${mediaCount}) exceeds the limit of ${rules.maxMedia} for ${rules.name}.`);
  }

  if (rules.mediaRequired && mediaCount === 0) {
    errors.push(`At least one image or video is required to post on ${rules.name}.`);
  }

  if (platform === 'twitter' && charCount > 240 && charCount <= 280) {
    warnings.push(`You are close to the limit! Consider shortening your content.`);
  }

  if (platform === 'instagram' && !content.includes('#')) {
    warnings.push(`Adding hashtags to your Instagram post can improve its visibility.`);
  }

  if (platform === 'linkedin' && content.length < 50) {
    warnings.push(`LinkedIn posts with longer, insightful content perform better.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

app.post('/api/auth/login', (req: Request<unknown, unknown, AuthLoginBody>, res: Response) => {
  const { email = '', password = '' } = req.body;
  const isValidEmail = email.trim().toLowerCase() === DEMO_USER.email.toLowerCase();
  const isValidPassword = password === DEMO_PASSWORD;

  if (!isValidEmail || !isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({
    token: signJwt(DEMO_USER),
    user: DEMO_USER,
    expiresIn: TOKEN_TTL_SECONDS,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.authUser });
});

// Endpoint: Validate
app.post('/api/posts/validate', requireAuth, (req: Request<unknown, unknown, ValidateBody>, res: Response) => {
  const { content = '', mediaCount = 0, platforms } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'At least one platform must be selected.' });
  }

  const results: Record<string, ValidationResult> = {};
  let overallValid = true;

  platforms.forEach((platform) => {
    const result = validatePostForPlatform(platform, content, mediaCount);
    results[platform] = result;
    if (!result.isValid) {
      overallValid = false;
    }
  });

  res.json({
    overallValid,
    results
  });
});

// Endpoint: Save (async MongoDB write)
app.post('/api/posts/save', requireAuth, async (req: Request<unknown, unknown, SaveBody>, res: Response) => {
  const {
    title,
    content = '',
    mediaCount = 0,
    platforms,
    mediaUrls = []
  } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'At least one platform must be selected.' });
  }

  let overallValid = true;
  const validationResults: Record<string, ValidationResult> = {};

  platforms.forEach((platform) => {
    const result = validatePostForPlatform(platform, content, mediaCount);
    validationResults[platform] = result;
    if (!result.isValid) {
      overallValid = false;
    }
  });

  if (!overallValid) {
    return res.status(400).json({
      error: 'Post validation failed for one or more platforms.',
      validationResults
    });
  }

  try {
    const saved = await savePost({
      title: title || 'Untitled Post',
      content,
      mediaCount,
      mediaUrls: mediaUrls || [],
      platforms
    });
    res.status(201).json({
      success: true,
      post: saved
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isMissingMongoUri = message.includes('MONGODB_URI');
    res.status(isMissingMongoUri ? 500 : 503).json({
      error: isMissingMongoUri
        ? 'Database is not configured. Add MONGODB_URI to the server environment.'
        : 'Database is unavailable. Please try again shortly.'
    });
  }
});

// Endpoint: History (async MongoDB query)
app.get('/api/posts/history', requireAuth, async (req, res) => {
  try {
    const posts = await getPosts();
    res.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isMissingMongoUri = message.includes('MONGODB_URI');
    res.status(isMissingMongoUri ? 500 : 503).json({
      error: isMissingMongoUri
        ? 'Database is not configured. Add MONGODB_URI to the server environment.'
        : 'Failed to fetch post history.'
    });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'Social Media Post Composer API is live!' });
});

app.get('/', (req, res) => {
  res.send('Social Media Post Composer API Server is running...');
});

// Only bind to local port when running outside of Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

export default app;
