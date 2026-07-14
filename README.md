# SocialComposer - Multi-Platform Post Composer

SocialComposer is a full-stack social media draft composer for creating, validating, previewing, and saving posts across multiple platforms. It includes a React/Vite frontend, an Express API, MongoDB Atlas persistence, and Vercel deployment support.

Live app: https://fullstack2-postcomposer.vercel.app

## Features

- Compose post drafts with a title, content, hashtags, and sample media attachments.
- Select one or more target platforms: X (Twitter), Facebook, Instagram, and LinkedIn.
- Preview the post in platform-specific feed mockups.
- Validate character limits, media limits, and platform requirements before saving.
- Save valid drafts to MongoDB Atlas.
- View previously saved drafts in the database publish registry.

## Validation Rules

| Platform | Character limit | Media limit | Required media | Warnings |
| --- | ---: | ---: | --- | --- |
| X (Twitter) | 280 | 4 | No | Warns after 240 characters |
| Facebook | 63,206 | 10 | No | None |
| Instagram | 2,200 | 10 | Yes | Warns when no hashtag is present |
| LinkedIn | 3,000 | 9 | No | Warns when content is under 50 characters |

Validation runs on the backend before saving. The frontend also includes fallback validation so the composer remains useful if the API is temporarily unavailable.

## Tech Stack

- Frontend: React, Vite, lucide-react
- Backend: Express, Node.js
- Database: MongoDB Atlas with Mongoose
- Deployment: Vercel
- Tooling: npm workspaces, Oxlint

## Project Structure

```text
.
|-- client/                 # React/Vite frontend
|   `-- src/
|       `-- components/
|           `-- PostComposer/
|-- server/                 # Express API and MongoDB helpers
|   `-- src/
|-- package.json            # Root workspace scripts
|-- package-lock.json
`-- vercel.json             # Vercel frontend + API routing
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5001
```

Run the full stack locally:

```bash
npm run dev
```

Local URLs:

- Frontend: http://localhost:5173
- API: http://localhost:5001/api

## Useful Scripts

```bash
npm run dev
npm run dev --workspace=client
npm run build --workspace=client
npm run lint --workspace=client
npm run dev --workspace=server
npm start --workspace=server
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api` | API health message |
| `POST` | `/api/posts/validate` | Validate a post for selected platforms |
| `POST` | `/api/posts/save` | Validate and save a post draft |
| `GET` | `/api/posts/history` | Fetch saved post drafts |

Example save payload:

```json
{
  "title": "Launch Update",
  "content": "Shipping the new SocialComposer flow #FullStack",
  "mediaCount": 0,
  "mediaUrls": [],
  "platforms": ["twitter", "linkedin"]
}
```

## Deployment Notes

The app is configured for Vercel through `vercel.json`.

Before deploying, add `MONGODB_URI` to the Vercel project environment variables for Production. Then deploy:

```bash
vercel deploy --prod
```

## Repository

GitHub: https://github.com/eshaansharma07/fullstack2_24bai70387
