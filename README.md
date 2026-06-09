# Interview AI YT

A full-stack generative AI assistant for interview preparation, document chat, and YouTube transcript analysis.

## Overview

This project consists of:

- `Backend/` — Node.js + Express API server with authentication, Google Gemini integration, PDF processing, YouTube transcript support, and RAG capabilities.
- `Frontend/` — React + Vite client with login, dashboard, interview chat, document chat, and YouTube chat experiences.
- `k8k/` — Kubernetes deployment manifests for containerized production deployments.

## Key Features

- User authentication and session management
- Interview question assistant with AI-powered responses
- Document chat using PDF upload, chunking, and vector search
- YouTube chat support using transcript extraction and AI summarization
- MongoDB-based data persistence for users, chat history, and document indexes
- CORS-enabled API to support local and hosted frontend clients

## Setup

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- MongoDB instance available
- Google Gemini API key available

### 2. Install dependencies

From the project root:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 3. Configure environment variables

Copy the example environment files and update the values:

```bash
cd Backend
copy .env.example .env

cd ../Frontend
copy .env.example .env
```

Then update the following values:

- `Backend/.env`
  - `MONGO_URI` — your MongoDB connection string
  - `JWT_SECRET` — secure token secret
  - `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` — Gemini API key
  - `GEMINI_MODEL` — model name
  - `EMBEDDING_MODEL` — embedding model name
- `Frontend/.env`
  - `VITE_API_URL` — backend base API URL
  - `VITE_GEMINI_API_KEY` — optional frontend Gemini API key if used by client code

### 4. Run locally

Start the backend API server:

```bash
cd Backend
npm run dev
```

Start the frontend app:

```bash
cd Frontend
npm run dev
```

Default local ports:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Application Flow

1. User authenticates via the frontend login/register flow.
2. Authenticated client interacts with the frontend pages and sends requests to the backend API.
3. Backend routes:
   - `/api/auth` — login, registration, and auth token handling
   - `/api/interview` — interview chat and AI answer generation
   - `/api/youtube` — YouTube transcript retrieval and analysis
   - `/api/pdf` — PDF upload, chunking, embedding, and chat retrieval
4. PDF and YouTube content is processed into embeddings and stored for similarity search.
5. AI responses are generated using Gemini and returned to the client.

## Folder Structure

- `Backend/`
  - `src/app.js` — Express app configuration and routes
  - `src/config` — database and Gemini config
  - `src/controllers` — API handlers
  - `src/middlewares` — auth, validation, error handling
  - `src/models` — Mongoose schemas
  - `src/services` — AI, PDF, embedding, RAG, and YouTube business logic
  - `src/utils` — helper utilities
  - `src/validations` — request validation schemas
- `Frontend/`
  - `src/App.jsx` — root app and providers
  - `src/app.routes.jsx` — React Router configuration
  - `src/features` — auth and interview feature contexts, pages, and hooks
  - `src/services/apiClient.js` — shared API client
  - `src/style` — shared styles
- `k8k/` — Kubernetes manifests for deployment, ingress, HPA, and services

## Deployment Notes

- Backend and frontend can be containerized using the included `Dockerfile`s.
- Kubernetes manifests in `k8k/` support deployment on a cluster with ingress and TLS.
- Update `Frontend/.env` and backend allowed CORS origins before deployment.

## Additional Notes

- The backend includes a `/health` endpoint for readiness and monitoring.
- Use secure secrets for production `JWT_SECRET` and `MONGO_URI`.
- `PDF_VECTOR_INDEX_NAME`, `VECTOR_SIMILARITY_THRESHOLD`, and `RAG_TOP_K` can be tuned for search quality.

---

If you want, I can also add a short `Contribution` section and examples for the main API endpoints.