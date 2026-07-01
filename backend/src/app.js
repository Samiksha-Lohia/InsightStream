import express from 'express';
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from 'cors';

const app = express();

const allowedOrigins = [
  "https://insight-stream-green.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Strip trailing slash if present
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    if (allowedOrigins.indexOf(cleanOrigin) !== -1 || cleanOrigin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", documentRoutes);

export { app };