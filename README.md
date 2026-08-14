# InsightStream — AI-Powered Asynchronous Document Analysis Platform

> **Not just a summary.** InsightStream is an asynchronous document analysis platform designed to digest, queue, and extract deep insights from uploaded files using state-of-the-art LLMs, while providing live status streaming and high-speed caching.

[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20MongoDB%20%7C%20Redis%20%7C%20Socket.io-orange?style=flat-square)](https://github.com)
[![AI Orchestration](https://img.shields.io/badge/AI-Groq%20Llama%203.3-blue?style=flat-square)](https://github.com)
[![Architecture](https://img.shields.io/badge/Architecture-Asynchronous%20BullMQ-green?style=flat-square)](https://github.com)

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Preview](#-preview)
- [What Makes InsightStream Different](#-what-makes-insightstream-different)
- [Core Features & Modules](#-core-features--modules)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Core Data Pipelines & Lifecycles](#-core-data-pipelines--lifecycles)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Security & Optimization Features](#-security--optimization-features)
- [License](#-license)

---

## 🌟 Overview

InsightStream processes complex document analysis jobs asynchronously. Because Large Language Model (LLM) queries are computationally heavy and highly latent, running analysis directly in the HTTP request-response cycle degrades user experience and blocks servers.

InsightStream handles this by decoupling the architecture: the Express server registers the upload, pushes the job to a **BullMQ** queue backed by **Redis**, and instantly returns a `202 Accepted` status. A separate **background worker** pulls the job, interacts with the **Groq API** to process the document text, and saves the generated markdown insights to **MongoDB**. Real-time updates are pushed to the client using **Socket.io** event triggers, and subsequent reads are optimized using an in-memory **Cache-Aside Redis configuration**.

---

## 📸 Preview

| Upload | Workspace Dashboard & Analysis |
| :---: | :---: |
| ![Auth Interface](images/Screenshot%202026-08-14%20105155.png) | ![Workspace Interface](images/Screenshot%202026-08-14%20105309.png) |

---

## What Makes InsightStream Different

These are the engineering highlights that separate InsightStream from simple LLM wrapper applications:

| Feature | Implementation |
|---|---|
| ⏳ **Asynchronous Ingestion** | Prevents request timeouts by instantly delegating analysis to a background queue thread. |
| 🔄 **BullMQ Job Queue** | Employs Redis-based job queues to ensure task durability, state transitions, and auto-retries on failures. |
| ⚡ **Cache-Aside Reads** | Bypasses database roundtrips completely for read operations, serving completed analysis directly from Redis. |
| 📊 **Real-Time Progress** | Pushes granular status events (Pending ➜ Processing ➜ Completed) directly to the user dashboard via Socket.io. |
| 🛡️ **JWT Route Guards** | Secures API requests and socket rooms, ensuring users only access their own uploaded files. |

---

## ✨ Core Features & Modules

### 1. Document Management & Processing
- **Asynchronous Analysis**: Upload raw text files and run complex structural analysis pipelines.
- **Dynamic Expiry Settings**: Support for setting specific retention/expiry timers on documents (24 Hours, 7 Days, 30 Days, or Indefinite).

### 2. Live Workspace Dashboard
- **Interactive Markdown Notebook**: View completed, detailed analysis and LLM insights in a sleek interface.
- **Live Status Feed**: Progress bars showing queue percentages and status updates as workers process text.

### 3. User Authentication
- **Secure Registration & Login**: Encrypted password storage using Bcrypt.
- **Token Authorization**: Custom JWT authorization headers securing private document endpoints.

---

## 🏗️ System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (React Frontend)
    participant API as API Server (Express)
    participant Middleware as Auth Middleware
    participant DB as Database (MongoDB)
    participant Queue as Redis Queue (BullMQ)
    participant Worker as Background Worker
    participant Groq as Groq AI API (Llama 3.3)

    Note over Client: User Login/Register Flow
    Client->>API: POST /api/auth/login { email, password }
    API->>DB: Query User by Email (verify password)
    DB-->>API: User details
    API-->>Client: 200 OK { token, user }
    Note over Client: Stores token in localStorage

    Note over Client: Document Upload Flow (Protected)
    Client->>API: POST /api/upload { content } [Auth Header: Bearer JWT]
    API->>Middleware: Verify JWT Token
    alt Token Invalid
        Middleware-->>Client: 401 Unauthorized
    else Token Valid
        Middleware->>API: Attach req.user
        API->>DB: Create Document (status: 'Pending', user: req.user._id)
        DB-->>API: Document saved with _id
        API->>Queue: Add job "process-document" { documentId }
        Queue-->>API: Job Queued
        API-->>Client: 202 Accepted { success: true, documentId }
    end

    Note over Client: UI shifts to progress dashboard<br/>Subscribes to Socket.io events
    
    Queue->>Worker: Dequeue Job
    Worker->>DB: Update status to 'Processing'
    Worker->>Queue: job.updateProgress(10, 20)
    Queue-->>API: Progress Event Triggered
    API->>Client: Socket.io Emit ("progress", 20%)

    Worker->>Groq: Chat completion request (llama-3.3-70b-versatile)
    Groq-->>Worker: Llama Insights Text (Markdown)

    Worker->>DB: Save insights & update status to 'Completed'
    Worker->>Queue: job.updateProgress(100)
    Queue-->>API: Completed Event Triggered
    API->>Client: Socket.io Emit ("progress", 100%, status: "Completed")

    Note over Client: Fetch Document Flow (Protected)
    Client->>API: GET /api/documents/:id [Auth Header: Bearer JWT]
    API->>Middleware: Verify JWT Token
    Middleware->>API: Attach req.user
    API->>Queue: Check Redis Cache (key: documentId)
    alt Cache Hit (Verified user ownership)
        Queue-->>API: Return cached JSON
        API-->>Client: 200 OK { document }
    else Cache Miss / Verification Failure
        API->>DB: Query MongoDB { _id: id, user: req.user._id }
        DB-->>API: Document details
        API->>Queue: Save in Redis (TTL: 1 hour)
        API-->>Client: 200 OK { document }
    end
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express.js**: HTTP server gateway framework.
- **MongoDB + Mongoose**: Document store and schema validation modeling.
- **Redis & BullMQ**: Multi-threaded asynchronous queue engine and caching database.
- **Groq SDK**: Access point for high-performance `llama-3.3-70b-versatile` text generation.
- **JWT (JSON Web Tokens)**: Decoded session tokens securing routes.
- **Socket.io**: WebSockets for push-style progress updates.

### Frontend
- **React + Vite**: Responsive client building block.
- **Vanilla CSS**: Foundational and optimized premium styling framework.
- **Context Providers**: Custom Auth, Socket, and Toast context engines.

---

## 📁 Project Directory Structure

```text
InsightStream/
├── backend/                  # Node.js + Express Server & BullMQ Worker
│   ├── src/
│   │   ├── config/           # Database (db.js) and Queue (queue.js) configs
│   │   ├── controllers/      # Route controllers (authController.js, documentController.js)
│   │   ├── middleware/       # JWT Authorization Guard (authMiddleware.js)
│   │   ├── models/           # Mongoose Document schemas (User.js, Document.js)
│   │   ├── routes/           # Express Endpoint routers (authRoutes.js, documentRoutes.js)
│   │   ├── utils/            # Socket events listeners (socketListeners.js)
│   │   ├── workers/          # Background tasks process (documentWorker.js)
│   │   ├── app.js            # Express application bootstrap
│   │   ├── index.js          # Main entrypoint initializing servers and sockets
│   │   ├── checkQueue.js     # Debug tool for queue verification
│   │   ├── inspectDb.js      # DB inspection script
│   │   └── flushRedis.js     # Redis flush utility
│   ├── .env                  # Port, MongoDB, Redis, and Groq configuration API keys
│   └── package.json
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── assets/           # Client assets and images
│   │   ├── components/       # UI Components (Dashboard, Workspace, Login, Register, Header, etc.)
│   │   ├── context/          # React context handlers (AuthProvider, SocketProvider, ToastProvider)
│   │   ├── utils/            # Helper utilities (titleGenerator.js)
│   │   ├── App.css           # Workspace stylesheets
│   │   ├── App.jsx           # Routing configuration
│   │   ├── index.css         # Styling system declarations
│   │   ├── main.jsx          # React app DOM bootstrap
│   │   └── config.js         # API and WebSocket host bindings
│   ├── index.html
│   └── package.json
```

---

## 🔄 Core Data Pipelines & Lifecycles

### 1. Queue Ingestion & Analysis Flow
```mermaid
graph TD
    Upload[Client uploads text document] --> SaveDoc[API saves document: Pending]
    SaveDoc --> Enqueue[Enqueue BullMQ job 'process-document']
    Enqueue --> APIResponse[API returns 202 status immediately]
    Enqueue --> Worker[Background worker pulls job]
    Worker --> APIStatus[Worker marks document: Processing]
    Worker --> LLMQuery[Queries Groq Llama 3.3 API]
    LLMQuery --> SaveResult[Saves generated markdown to MongoDB]
    SaveResult --> MarkDone[Updates document: Completed]
```

### 2. Cache-Aside Retrieval Pipeline
```mermaid
graph TD
    GetReq[Client GET /api/documents/:id] --> CheckCache{Check Redis Cache}
    CheckCache -->|Hit| ReturnCache[Return cached document JSON]
    CheckCache -->|Miss| QueryDB[Query MongoDB]
    QueryDB --> StoreCache[Store in Redis with 1 Hour TTL]
    StoreCache --> ReturnDB[Return document JSON]
```

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret_key
```

---

## ⚡ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** running locally or on Atlas
- **Redis** running locally (port 6379)

### 1. Setup Backend Server
```bash
cd backend
npm install
npm run dev
```
The API server starts at `http://localhost:3000`.

### 2. Setup Frontend Application
```bash
cd ../frontend
npm install
npm run dev
```
The Vite development server starts at `http://localhost:5173`.

---

## 🧠 Security & Optimization Features

- **Decoupled Main Thread**: Heavy AI text generation logic is handled on a background process queue, leaving the HTTP server highly responsive.
- **Redis Cache-Aside**: Significantly drops database read overhead. The cache is automatically cleared on deletions or updates.
- **Encrypted Password Storage**: Uses Bcrypt hashing for password credentials.
- **Route Guard Middleware**: Validates JWT signatures and verifies owner IDs before granting document access.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
