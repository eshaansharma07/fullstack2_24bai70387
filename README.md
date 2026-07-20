# SocialComposer - Full Stack Experiments

SocialComposer is a course project built as a series of experiments that gradually lead toward one final full-stack product. The current application focuses on social media post composition, frontend draft management, validation, previews, MongoDB persistence, and deployment.

Live app: https://fullstack2-postcomposer.vercel.app

## Experiments

### Experiment 1: Multi-Platform Post Composer

- Compose post drafts with a title, content, hashtags, and sample media attachments.
- Select one or more target platforms: X (Twitter), Facebook, Instagram, and LinkedIn.
- Preview the post in platform-specific feed mockups.
- Validate character limits, media limits, and platform requirements before saving.
- Publish valid drafts to MongoDB Atlas.
- View previously published drafts in the database publish registry.

### Experiment 2: Frontend Draft Management System

Aim: Implement a draft management system that allows users to save, retrieve, and manage post drafts within the frontend, with simulated backend-style interactions.

Objectives:

- Manage draft data using React frontend state.
- Implement CRUD operations for draft handling.
- Demonstrate asynchronous UI workflows with mock delays.
- Persist drafts using browser `localStorage`.

COs mapped: CO2 - BT2, CO3 - BT3.

### Experiment 3: Redux Toolkit State Management

Aim: Design and implement centralized state management using Redux Toolkit for posts, drafts, and platform-related data.

Objectives:

- Understand global state management through a single Redux store.
- Implement Redux Toolkit and React-Redux for scalable state handling.
- Store draft and published-post collections in normalized `ids` + `entities` structures.
- Manage asynchronous workflows through Redux async thunks.
- Reduce prop drilling by connecting the composer workflow to Redux selectors and dispatch actions.

COs mapped: CO1 - BT1, CO2 - BT2, CO3 - BT3.

## Features

- Save the current composer state as a local draft.
- Update an existing local draft after loading it back into the composer.
- View saved local drafts in a dedicated Draft Control Room.
- Edit/load local drafts asynchronously using mock API-style delays.
- Delete local drafts from browser storage.
- Publish validated posts to the backend database separately from local draft saving.
- Manage composer, draft, published post, and selected platform state through Redux Toolkit.
- Use a bold green, white, and black frontend direction inspired by maximalism, brutalism, and spatial layout.

## Validation Rules

| Platform | Character limit | Media limit | Required media | Warnings |
| --- | ---: | ---: | --- | --- |
| X (Twitter) | 280 | 4 | No | Warns after 240 characters |
| Facebook | 63,206 | 10 | No | None |
| Instagram | 2,200 | 10 | Yes | Warns when no hashtag is present |
| LinkedIn | 3,000 | 9 | No | Warns when content is under 50 characters |

Validation runs on the backend before saving. The frontend also includes fallback validation so the composer remains useful if the API is temporarily unavailable.

## Tech Stack

- Frontend: React, TypeScript, Vite, lucide-react
- State management: Redux Toolkit, React-Redux
- Backend: TypeScript, Express, Node.js
- Database: MongoDB Atlas with Mongoose
- Deployment: Vercel
- Tooling: npm workspaces, TypeScript, Oxlint

## Project Structure

```text
.
|-- client/                 # React/Vite frontend
|   `-- src/
|       `-- components/
|           `-- PostComposer/
|       `-- store/          # Redux Toolkit store and slices
|       `-- types.ts        # Shared client TypeScript types
|-- server/                 # Express API and MongoDB helpers
|   `-- src/
|-- tsconfig.json           # Workspace TypeScript references
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

## Redux State Structure

Experiment 3 introduces two main Redux slices:

- `posts`: composer fields, local drafts, published posts, draft loading status, and publish status.
- `platforms`: normalized platform rule data and selected platform ids.

The `posts` slice stores draft and published post collections in a normalized form:

```js
{
  ids: ["post-id-1", "post-id-2"],
  entities: {
    "post-id-1": { id: "post-id-1", title: "Draft title" }
  }
}
```

Async thunks are used for:

- Loading local drafts from `localStorage`.
- Saving and updating local drafts with mock latency.
- Loading a draft into the composer.
- Deleting local drafts.
- Fetching published posts from the API.
- Publishing the current post to MongoDB through the backend API.

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
