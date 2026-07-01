import { Worker } from "bullmq";
import connectDb from "../config/db.js";
import Document from "../models/Document.js";
import IORedis from "ioredis";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// 1. Initialize Database Connection
connectDb();

// 2. Initialize Groq AI (via OpenAI SDK)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// 3. Initialize Redis Connection
const redisUrl = process.env.REDIS_URL;
const connection = redisUrl
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null, // Required for BullMQ workers
    });

connection.on("error", (error) => {
  console.error("[❌ Worker Redis Connection Error]:", error);
});

// 4. Create the Worker
const documentWorker = new Worker(
  "document-queue",
  async (job) => {
    const { documentId } = job.data;
    console.log(`[⚙️ Worker] Picked up job for Document ID: ${documentId}`);

    try {
      // 1. Fetch Data
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error(`Document with ID ${documentId} not found`);
      }
      
      // Tell the queue we are 10% done
      await job.updateProgress(10); 

      // 2. Update Status
      document.status = "Processing";
      await document.save();
      
      // Tell the queue we are 20% done before the AI call
      await job.updateProgress(20);

      // 3. The AI Call
      console.log(`[⚙️ Worker] Querying Groq AI for document: ${documentId}`);
      const chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Analyze this document and extract key insights: ${document.content}`
          }
        ]
      });
      const aiResponse = chatCompletion.choices[0]?.message?.content || "No insights generated.";
      
      // Tell the queue the heavy lifting is done (70%)
      await job.updateProgress(70);

      // 4. Finalize
      document.insights = aiResponse;
      document.status = "Completed";
      await document.save();

      // Clear the Redis cache for this document so the API fetches the completed data from MongoDB
      await connection.del(documentId);

      // Tell the queue we are 100% finished!
      await job.updateProgress(100);
      console.log(`[⚙️ Worker] Job completed successfully for Document ID: ${documentId}`);
      return { documentId, status: "Completed" };

    } catch (error) {
      // Defensive Error Handling
      console.error(`[❌ Worker] Error processing ${documentId}:`, error.message);
      
      try {
        await Document.findByIdAndUpdate(documentId, { status: "Failed" });
        await connection.del(documentId);
      } catch (dbError) {
        console.error("Critical: Failed to update database status on crash.", dbError);
      }
    }
  },
  { connection }
);

// Catch any background queue errors
documentWorker.on("error", (err) => {
  console.error("[Worker] Queue Error:", err);
});

export default documentWorker;