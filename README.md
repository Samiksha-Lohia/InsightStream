# InsightStream: Immersive AI Document Insights Pipeline

InsightStream is an asynchronous document analysis platform designed to process large text payloads, generate generative AI insights using the Groq Cloud API (Llama 3.3), and stream progress updates in real-time to a modern frontend dashboard via WebSockets. It features secure JWT authentication, document queuing using Redis/BullMQ, and high-performance caching.

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Message Broker / Queue**: Redis (BullMQ)
* **AI Provider**: Groq Cloud API (Llama 3.3 70b via OpenAI SDK)
* **Real-time Communication**: Socket.io
* **Authentication**: JWT (jsonwebtoken) & bcryptjs for secure password hashing

### Frontend
* **Build Tool / Bundler**: Vite (React Compiler is disabled for optimal build and dev performance)
* **Library**: React 19
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS v4 (with custom glassmorphic aesthetics)
* **Animations**: GSAP (GreenSock Animation Platform) & Framer Motion
* **Icons**: Lucide React
* **Markdown Support**: react-markdown

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
│   ├── .env                     # Backend configuration secrets
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/              # Static assets
    │   ├── components/          # UI components (Dashboard, ErrorBoundary, Header, Login, ProfileDropdown, ProgressSection, Register, ResultCard, Settings, SkeletonView, UploadZone)
    │   ├── context/             # React Context (AuthProvider, SocketProvider, ToastProvider)
    │   ├── utils/               # Helper utilities (titleGenerator)
    │   ├── App.css              # Main App styling
    │   ├── App.jsx              # Application Layout & Routes
    │   ├── ProgressTracker.jsx  # Progress Tracker logic/components
    │   ├── UploadInterface.jsx  # Upload Interface layout
    │   ├── config.js            # Centralized API url config
    │   ├── index.css            # Custom CSS system and tailwind overrides
    │   └── main.jsx             # React client entrypoint
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** instance (local or Atlas)
* **Redis** server running locally (`127.0.0.1:6379` or remote via `REDIS_URL`)
* **Groq API Key** from Groq Console

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env`:
   ```env
   PORT=3000
   MONGODB_URL=mongodb+srv://<your_mongodb_credentials>
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_URL=redis://127.0.0.1:6379 # Optional: full connection string
   GROQ_API_KEY=<your_groq_api_key>
   JWT_SECRET=<your_jwt_secret_or_fallback>
   ```
4. Start the Express API server:
   ```bash
   npm run dev
   ```
5. In a **separate terminal**, start the BullMQ worker:
   ```bash
   npm run worker
   ```

### 2. Frontend Setup
1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

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
