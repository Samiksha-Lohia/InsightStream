import express from 'express';
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from 'cors';

const app=express();

app.use(cors({
  origin: ["https://insight-stream-green.vercel.app/"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true 
}));

// CORS Middleware to allow requests from frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", documentRoutes);

export {app};