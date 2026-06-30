# System Design: InsightStream Asynchronous Analysis Pipeline

This document describes the high-level architecture, design decisions, data flow, and state machine of the **InsightStream** document analysis platform.

---

## 🏗️ System Architecture Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (React Frontend)
    participant API as API Server (Express)
    participant DB as Database (MongoDB)
    participant Queue as Redis Queue (BullMQ)
    participant Worker as Background Worker
    participant Groq as Groq AI API (Llama 3.3)

    Client->>API: POST /api/upload { content }
    API->>DB: Create Document (status: 'Pending')
    DB-->>API: Document saved with _id
    API->>Queue: Add job "process-document" { documentId }
    Queue-->>API: Job Queued
    API-->>Client: 202 Accepted { success: true, documentId }
    Note over Client: UI shifts to progress dashboard<br/>Subscribes to Socket.io events
    
    Queue->>Worker: Dequeue Job
    Worker->>DB: Update status to 'Processing'
    Worker->>Queue: job.updateProgress(10, 20)
    Queue-->>API: Progress Event Triggered
    API->>Client: Socket.io Emit ("progress", 20%)

    Worker->>Groq: Chat completion request
    Groq-->>Worker: Llama Insights Text (Markdown)

    Worker->>DB: Save insights & update status to 'Completed'
    Worker->>Queue: job.updateProgress(100)
    Queue-->>API: Completed Event Triggered
    API->>Client: Socket.io Emit ("progress", 100%, status: "Completed")

    Client->>API: GET /api/documents/:id (Fetch insights)
    API->>DB: Query by ID
    DB-->>API: Document details + Insights
    API-->>Client: 200 OK { document }
    Note over Client: Fast-forwards UI to 100%,<br/>renders Markdown insights card
```

---

## 🗄️ Database & Schema Design

InsightStream utilizes MongoDB for persistence of text inputs and AI outputs.

### Document Schema
```javascript
const DocumentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  insights: {
    type: String, // Stores final generated Markdown insights
    default: null,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
```

---

## 🚦 Pipeline State Machine

A document progresses through the following states in the database:

1. **Pending**: The document has been uploaded to the Express API and a job has been registered in the BullMQ queue.
2. **Processing**: The background worker has picked up the job and is querying the Groq Cloud API using the Llama-3.3-70b model.
3. **Completed**: Groq returned the insights successfully, and the worker saved the insights and updated the status.
4. **Failed**: An error occurred in the queue or during the AI generation. The database is updated defensively so that the client receives feedback.

---

## 📡 Live Event & Socket Orchestration

* **Producer**: The Express API pushes a job structure containing `{ documentId }` into the `"document-queue"` Redis database.
* **Consumer**: The `documentWorker.js` process acts as a BullMQ worker executing the analysis logic. It notifies the queue of its progress using `job.updateProgress(value)`.
* **Broker**: The Express server listens to the queue's internal events using `QueueEvents` (`progress` and `completed` listeners) and broadcasts them instantly to all socket connections.
* **Client**: The frontend listens for `"progress"` events. When the target `documentId` receives a 100% or Completed status, the client fetches the document details and transitions from the loading skeleton into the markdown-rendered results card.

---

## 💾 Caching Strategy (Redis)

To minimize database lookups and speed up response times for frequently accessed documents, the platform employs a **Cache-Aside pattern** using Redis:
1. When a client requests insights via `GET /api/documents/:id`, the API server checks Redis.
2. **Cache Hit**: If present, the stringified document is parsed and returned instantly, skipping the MongoDB query.
3. **Cache Miss**: If absent, the document is fetched from MongoDB, cached in Redis with a **1-hour Time-To-Live (TTL)** (`set(id, data, "EX", 3600)`), and then returned.
