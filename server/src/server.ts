import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';

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

// Endpoint: Validate
app.post('/api/posts/validate', (req: Request<unknown, unknown, ValidateBody>, res: Response) => {
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
app.post('/api/posts/save', async (req: Request<unknown, unknown, SaveBody>, res: Response) => {
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
app.get('/api/posts/history', async (req, res) => {
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
