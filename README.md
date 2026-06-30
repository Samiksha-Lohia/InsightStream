# InsightStream: Immersive AI Document Insights Pipeline

InsightStream is an asynchronous document analysis platform designed to process large text payloads, generate generative AI insights using Groq Cloud API (Llama 3.3), and stream progress updates in real-time to a modern frontend dashboard via WebSockets.

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Message Broker / Queue**: Redis (BullMQ)
* **AI Provider**: Groq Cloud API (Llama 3.3 70b)
* **Real-time Communication**: Socket.io

### Frontend
* **Build Tool / Bundler**: Vite
* **Library**: React 19
* **Styling**: Tailwind CSS (with custom glassmorphism)
* **Animations**: GSAP (GreenSock Animation Platform) & Framer Motion
* **Markdown Support**: react-markdown

---

## 📁 Repository Structure

```directory
Insight Stream/
├── backend/
│   ├── src/
│   │   ├── config/              # Redis and Database configurations
│   │   ├── controllers/         # Express controllers (upload, retrieval)
│   │   ├── models/              # Mongoose schemas (Document model)
│   │   ├── routes/              # Express API route registrations
│   │   ├── utils/               # Socket.io listeners
│   │   ├── workers/             # BullMQ document processing workers
│   │   └── index.js             # Express API entrypoint
│   ├── .env                     # Backend configuration secrets
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/          # UI components (ResultCard, UploadZone, Dashboard)
    │   ├── context/             # React Context (SocketProvider, ToastProvider)
    │   ├── App.jsx              # Application Layout
    │   ├── main.jsx             # React client entrypoint
    │   └── index.css            # Custom CSS system and tailwind overrides
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** instance (local or Atlas)
* **Redis** server running locally (`127.0.0.1:6379`)
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
   MONGO_URI=mongodb+srv://<your_credentials>
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   GROQ_API_KEY=<your_groq_api_key>
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
1. **Upload**: User pastes a raw text payload in the frontend and clicks "Analyze Document".
2. **Acceptance**: Backend saves the document in MongoDB as `Pending` and pushes a job to Redis. It immediately replies with `202 Accepted` and a `documentId`.
3. **Tracking**: The frontend transitions to the progress screen and listens to WebSocket updates filtered by the `documentId`.
4. **Processing**: The BullMQ worker picks up the job, marks the status as `Processing` (20%), calls the Groq Cloud API (Llama 3.3) to extract insights, updates the DB with the results, and sets status to `Completed` (100%).
5. **Updates**: Socket.io broadcasts these progress steps (10% -> 20% -> 70% -> 100%) to the client.
6. **Reveal**: The frontend fast-forwards to 100% upon worker completion, hides the progress screen via GSAP morphing animations, and presents the Markdown-rendered AI insights.
