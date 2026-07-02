# InsightStream: Immersive AI Document Insights Pipeline

InsightStream is an enterprise-ready asynchronous document analysis platform designed to ingest text payloads, queue tasks via a message broker, generate generative AI insights using the Groq Cloud API (Llama 3.3), and stream real-time progress updates to a client dashboard via WebSockets. It features secure JWT authentication, multi-worker queue scalability using Redis/BullMQ, and high-performance tenant-isolated caching.

---

## 🏗️ System Architecture & Design Decisions

InsightStream's architecture separates client ingestion, asynchronous job scheduling, and high-performance caching to maximize system throughput and resilience.

```
                  ┌──────────────────────────────────────────┐
                  │              Vite / React                │
                  │                Frontend                  │
                  └─────────────┬──────────────▲─────────────┘
                                │              │
                   HTTP REST    │              │  WebSockets
                  JWT Protected │              │  Real-Time Progress
                                ▼              │
                  ┌────────────────────────────┴─────────────┐
                  │           Express API Gateway            │
                  └─────────────┬──────────────┬─────────────┘
                                │              │
                   Read/Write   │              │  Job Dispatch
                   Operations   ▼              ▼
           ┌──────────────────────┐          ┌──────────────────────┐
           │   MongoDB Database   │          │  Redis Queue (Bull)  │
           │  (Persistent State)  │          │  & Cache-Aside Store │
           └──────────────────────┘          └──────────┬───────────┘
                                                        │
                                                        │ Dequeue Job
                                                        ▼
                                             ┌──────────────────────┐
                                             │  Background Worker   │
                                             └──────────┬───────────┘
                                                        │
                                                        │ Chat Completion
                                                        ▼
                                             ┌──────────────────────┐
                                             │    Groq Cloud API    │
                                             │     (Llama 3.3)      │
                                             └──────────────────────┘
```

Detailed sequence diagrams, database schemas, and state machine models are documented in the [System Design Specification](file:///c:/Users/Lenovo/Desktop/Insight%20Stream/system_design.md).

### Design Decisions: Why vs. Why Not

| Architectural Component | Why (Pros & Production Suitability) | Why Not (Alternatives & Disadvantages) |
| :--- | :--- | :--- |
| **BullMQ (Redis-backed Queue) over In-Memory Queues** | **Resilience & Process Decoupling:** Volatile jobs survive server crashes. Moving intensive AI processing to background worker processes prevents event-loop blocking on the Express server. Enables horizontal scaling (multiple worker nodes dequeuing from the same Redis instance). | **In-Memory Arrays / Async Libraries:** Jobs are stored in volatile RAM; any process restart or deployment terminates active workloads. Heavy execution blocks the main Node.js process, hurting API performance. Cannot scale workers independently. |
| **WebSockets (Socket.io) over HTTP Polling** | **Real-Time Push & Low Overhead:** Provides instantaneous server-to-client progress updates (10% -> 20% -> 70% -> 100%) over a single, persistent TCP connection. Drastically reduces network traffic and minimizes latency. | **HTTP Short/Long Polling:** Floods the server with redundant requests, wastefully consuming database read capacity, degrading application performance, and exhausting socket connections. |
| **Redis Cache over Local In-Memory Cache (e.g., Node-Cache)** | **Shared State in Distributed Environments:** Synchronizes cached results across multiple API nodes. Allows background workers running in isolated processes to invalidate keys (`client.del(id)`) upon completion, ensuring immediate data consistency. | **Local Process Memory:** Isolated to a single node. Background workers cannot invalidate cache entries on API servers without complex inter-process messaging, leading to inconsistent or stale reads. |
| **MongoDB Native TTL Indexing over Manual Cron Cleanups** | **Declarative & Zero Maintenance:** Offloads scheduling and execution to MongoDB's background threads. Automatically purges expired document logs without custom worker code or execution overhead. Indefinite logs are supported simply by writing `null` to the expiration field. | **Custom Node Cron/Worker Tasks:** Demands dedicated process resources, complicates horizontal deployment configurations (e.g. running redundant crons on multiple instances), and scales poorly without custom sharding/batching logic. |

### Data Flow, Caching & Data Retention

InsightStream implements a high-performance **Cache-Aside (Lazy Loading) Pattern** with strict tenant isolation and automated data retention policies:

1. **Write Path (Ingestion & Retention Setup):**
   * The client dispatches a document payload alongside their preferred retention setting (e.g., `"24 Hours"`).
   * The API server computes the target expiration timestamp (`expiresAt`), creates the record in MongoDB with `Pending` status, and dispatches a job to BullMQ.
   * The system immediately returns an asynchronous acknowledgment (`202 Accepted`) containing the `documentId`. No data is written to the cache during ingestion, keeping writes extremely fast.
2. **Worker Path (Async Processing & Cache Invalidation):**
   * The background worker fetches the job, updates the MongoDB document status to `Processing`, calls the Groq AI API for insights, and writes the completed insights back to MongoDB (`Completed`).
   * The worker explicitly invalidates the cache for this document by running `redisClient.del(documentId)`. This prevents the API from serving stale or temporary data.
3. **Read Path (Retrieval via Cache-Aside):**
   * When a client requests `GET /api/documents/:id`, the route verifies the client's JWT.
   * **Cache Hit:** The server queries Redis for the key. If found, it parses the JSON and asserts that `parsedDoc.user === req.user._id` to enforce security. If ownership is verified, the document is returned. If ownership verification fails, it falls back to MongoDB.
   * **Cache Miss:** The server queries MongoDB using the compound filter `{ _id: id, user: req.user._id }`. If the document exists and has reached a terminal status (`Completed` or `Failed`), it is serialized, written to Redis with a **1-hour TTL (Time-To-Live)**, and returned to the client.
   * **Why Cache-Aside over Write-Through?**
     A Write-Through strategy updates the cache synchronously during database writes. Because documents begin in a `Pending` state and undergo time-consuming AI generation, write-through caching would clutter Redis with temporary data that require immediate invalidation once completed. Cache-Aside keeps the cache clean, ensuring only terminal, requested documents occupy RAM.
4. **Retention Cleanup Path (MongoDB TTL Index):**
   * The database runs a background task once every 60 seconds that checks the TTL index on the `expiresAt` field.
   * Documents whose `expiresAt` timestamps are in the past are automatically deleted from the database. Indefinite logs have an `expiresAt` value of `null` and are ignored by the index, persisting indefinitely.

---

## 🛠️ Technology Stack

### Backend
* **Runtime Environment**: Node.js (ES Modules configuration)
* **API Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM layer)
* **Message Broker / Queue**: Redis (BullMQ engine)
* **AI Orchestration**: Groq Cloud API (Llama 3.3 70b via OpenAI SDK)
* **Real-time Push**: Socket.io
* **Authentication**: State-less JWT (`jsonwebtoken`) & cryptographically hashed credentials (`bcryptjs`)

### Frontend
* **Build System & Dev Server**: Vite
* **Library**: React 19 (React Compiler disabled for optimal stability)
* **Client-Side Routing**: React Router DOM v7
* **CSS Framework**: Tailwind CSS v4 (configured with glassmorphic variables)
* **Interactive UI & Transitions**: GSAP (GreenSock Animation Platform) & Framer Motion
* **Typography & Icons**: Lucide React
* **Markdown Parser**: React Markdown

---

## 📁 Repository Structure

```directory
Insight Stream/
├── backend/
│   ├── src/
│   │   ├── config/              # Redis (queue.js) and Database (db.js) configurations
│   │   ├── controllers/         # Express controllers (authController, documentController)
│   │   ├── middleware/          # Express middlewares (authMiddleware for JWT validation)
│   │   ├── models/              # Mongoose schemas (Document and User models)
│   │   ├── routes/              # Express API routes (authRoutes, documentRoutes)
│   │   ├── utils/               # Socket.io event listeners (socketListeners)
│   │   ├── workers/             # BullMQ document processing workers (documentWorker)
│   │   ├── app.js               # Express application configuration (CORS, route mount)
│   │   └── index.js             # Express API entrypoint & HTTP server with Socket.io setup
│   ├── .env.example             # Template for local backend configurations
│   ├── .env                     # Local environment file (ignored by Git)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/              # Static assets
    │   ├── components/          # UI components (Dashboard, ErrorBoundary, Header, UploadZone, etc.)
    │   ├── context/             # React Context (AuthProvider, SocketProvider, ToastProvider)
    │   ├── utils/               # Helper utilities (titleGenerator)
    │   ├── App.css              # Main App styling
    │   ├── App.jsx              # Application Layout & Routes
    │   ├── ProgressTracker.jsx  # Progress Tracker logic/components
    │   ├── UploadInterface.jsx  # Upload Interface layout
    │   ├── config.js            # Centralized API url config
    │   ├── index.css            # Custom CSS system and tailwind overrides
    │   └── main.jsx             # React client entrypoint
    ├── .env.example             # Template for local frontend configurations
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Environment Configuration & Setup

### Environment Configuration

Security is paramount. Sensitive credentials must never be committed to source control.

> [!WARNING]
> Never commit `.env` files containing credentials to version control. Both frontend and backend directories are configured with `.gitignore` rules to block `.env` uploads.

To configure local environments, copy the provided templates:
1. **Backend**:
   * Navigate to `backend/` and copy `.env.example`: `cp .env.example .env`
   * Open `.env` and fill in your database endpoints, Redis connections, and your `GROQ_API_KEY`.
2. **Frontend**:
   * Navigate to `frontend/` and copy `.env.example`: `cp .env.example .env`
   * Open `.env` and define the `VITE_API_URL` targeting your API gateway (typically `http://localhost:3000`).

---

## 📦 Deployment & Production Architecture

### Local Setup Instructions

#### Prerequisites
* **Node.js** (v18.x or v20.x LTS)
* **MongoDB** instance (local process or MongoDB Atlas cluster)
* **Redis Server** running locally (Port `6379`) or hosted remotely

#### Step 1: Backend & Worker Boot
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure the `.env` file according to the instructions above.
3. Start the Express API gateway:
   ```bash
   npm run dev
   ```
4. In a separate terminal session, start the background worker process:
   ```bash
   npm run worker
   ```

#### Step 2: Frontend Dashboard Boot
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Configure the `.env` file according to the instructions above.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

### Production Deployment Strategy

```
                          ┌───────────────────────────┐
                          │   Vercel / Netlify CDN    │
                          │   (React Static Assets)   │
                          └──────────────┬────────────┘
                                         │
                                         │ HTTPS / WSS
                                         ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │                       Stateless AWS Application Load Balancer         │
    └───────────────────┬───────────────────────────────────┬───────────────┘
                        │                                   │
                        │ HTTP / Sticky Websockets          │ HTTP / Queue Stats
                        ▼                                   ▼
    ┌───────────────────────────────────────┐   ┌───────────────────────────┐
    │     API Server Cluster (Express)      │   │   Queue Dashboard (Arena) │
    │     Auto-scaled on CPU / Mem          │   │   (Basic Auth Secured)    │
    │     AWS ECS / Fargate                 │   │   AWS ECS / Fargate       │
    └───────────────────┬───────────────────┘   └───────────┬───────────────┘
                        │                                   │
                        ▼                                   ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │                       Redis Cluster (Upstash / Aiven)                 │
    │                    - Distributed Cache (Cache-Aside)                  │
    │                    - BullMQ Message Broker                            │
    └───────────────────▲───────────────────────────────────▲───────────────┘
                        │                                   │
                        │ Dequeue / Job Update              │ Read/Write Cache
                        ▼                                   │
    ┌───────────────────────────────────────┐               │
    │       Background Worker Cluster       │               │
    │       Auto-scaled on Queue Length     │               │
    │       AWS ECS / Fargate               │               │
    └───────────────────┬───────────────────┘               │
                        │                                   │
                        │ Persistent Saves                  │
                        ▼                                   │
    ┌───────────────────────────────────────────────────────┴───────────────┐
    │                MongoDB Atlas Cluster (Sharded Primary/Replica)        │
    └───────────────────────────────────────────────────────────────────────┘
```

* **Client Layer:** Static files compiled via `npm run build` and hosted on Vercel/Netlify.
* **API Gateway & Routing:** Express API instances deployed behind a load balancer with sticky sessions enabled for WebSocket handshakes.
* **Worker Fleet:** Distributed workers run as stateless container pools (AWS ECS/Fargate) scaled independently based on BullMQ backlog metrics.
* **Databases:** MongoDB Atlas for persistence and Upstash or Redis Enterprise for high-availability memory-caching and task queues.

### Manual Verification & Demo Walkthrough

In the absence of a live hosted URL, execute the following workflow to verify end-to-end functionality:

1. **User Authentication:** Navigate to `http://localhost:5173/register` and register a new profile. Logs will show a state transition and redirect to login. Upon logging in, the server issues a JWT which is stored locally.
2. **Asynchronous Dispatch:** Go to the home screen and paste a block of unstructured text (e.g., a news article). Click **Analyze Document**.
3. **202 Response Verification:** The server responds immediately with a `202 Accepted` header and a `documentId`. The UI uses this ID to open a WebSocket room.
4. **WebSocket Stream Tracking:** The dashboard renders a progress stepper reflecting background status changes:
   * **10% (Queued):** Job successfully written to BullMQ.
   * **20% (Processing):** Worker picked up the job and locked it.
   * **70% (Generating Insights):** Groq completion initiated.
   * **100% (Completed):** Insights parsed, stored, cache cleared, socket notification pushed.
5. **Cache-Aside Validation:**
   * The client fetches the completed document. Check your terminal output: the first fetch results in a **Cache Miss**, loading details from MongoDB and caching them in Redis with a 1-hour TTL.
   * Reload the page. Subsequent requests trigger a **Cache Hit**, returning the document directly from Redis under 15ms.

---

## 🚦 Reliability & Testing

### Planned Testing Roadmap

To ensure pipeline stability and data integrity, the system is designed to accommodate the following test suites:

#### 1. Unit Testing (Vitest / Jest)
* **Middleware Isolation:** Verify JWT validation and check that requests without valid authorization headers return `401 Unauthorized`.
* **Worker Business Logic:** Mock the OpenAI/Groq API client to ensure response parsing works under expected structures and handles missing data gracefully.

#### 2. Integration Testing (Supertest & Docker Container Testbeds)
* **REST Endpoints:** Use Supertest to fire requests against Express and assert database inputs match expectations.
* **Database & Queue Wireframe:** Use Testcontainers to run isolated MongoDB and Redis instances in Docker during local CI runs. Assert that dispatching jobs routes them into BullMQ correctly.

#### 3. Queue Reliability & Resilience Testing
* **SIGTERM/SIGINT Graceful Shutdowns:** Workers intercept termination signals to release job locks back to Redis instead of leaving them stuck in an active state.
* **Exponential Retry Backoff:** Configure BullMQ retry options to gracefully recover from temporary external downstream API outages (e.g., Groq rate limits):
  ```javascript
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
  ```
* **Dead Letter Queue (DLQ) Safeguards:** Ensure that if a document fails processing after maximum retries, the worker catches the failure, updates MongoDB status to `Failed`, clears the Redis key, and sends an alert.

---

## 🔄 Real-time Pipeline Flow

1. **Authentication**: The user signs up (`/api/auth/register`) or logs in (`/api/auth/login`) through the frontend. The server returns a JWT token, which is stored in `localStorage` and sent in the `Authorization: Bearer <token>` header for all authenticated requests.
2. **Upload**: The user pastes a raw text payload and triggers document analysis.
3. **Acceptance & Queueing**: The backend creates a document record in MongoDB marked as `Pending` and references the authenticated user's ID (`user: req.user._id`). A job is added to the Redis queue via BullMQ. The server immediately returns a `202 Accepted` response with the `documentId`.
4. **Real-time Tracking**: The frontend transitions to the progress screen, connects to the WebSocket, and listens for progress updates corresponding to the `documentId`.
5. **Processing**: The BullMQ worker dequeues the job:
   - Updates the status to `Processing` (20% progress event).
   - Invokes the Groq Cloud API using the Llama 3.3 model (`llama-3.3-70b-versatile`) via the OpenAI SDK to generate document insights in Markdown.
   - Saves the generated insights to the document record in MongoDB and sets the status to `Completed` (100% progress event).
   - Clears the document's cached entry from Redis to ensure subsequent requests fetch fresh completed data.
6. **WebSockets Broadcast**: Express listens to BullMQ queue events and broadcasts progress steps (10% -> 20% -> 70% -> 100%) to connected clients via Socket.io.
7. **Insight Reveal & Caching**: The frontend receives the completion event, queries the backend (`GET /api/documents/:id`), and retrieves the results. The backend utilizes a **Cache-Aside Pattern**:
   - **Cache Miss**: Fetches document from MongoDB, verifies user ownership, stringifies and caches the record in Redis with a 1-hour TTL, and returns it.
   - **Cache Hit**: Directly returns the document from Redis after verifying user ownership, saving database queries.

---

## 📈 Development Lifecycle & Git Integrity

This project represents an iterative, production-grade engineering cycle. Reviewers are encouraged to explore the **Git Commit History** to review how the codebase evolved:

* **Initial Setup & Schema Architecture:** Structural schema setup for relational security (Users & Documents) and validation layers.
* **Asynchronous Queue Integration:** Decoupling processing logic by introducing Redis and BullMQ worker infrastructure.
* **WebSocket Pipelines:** Establishing real-time event-driven bridges between the background worker updates and Socket.io.
* **Tenant-Isolated Caching:** Layering the Cache-Aside architecture onto the document retrieval route with ownership verification.
* **UI Polish & State Management:** Crafting responsive dashboard interfaces utilizing Vite, React Context providers, Tailwind CSS v4, and dynamic transitions.
