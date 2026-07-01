import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

const isRenderInternalRedis = (url) => {
  try {
    const parsed = new URL(url);
    return !parsed.hostname.includes('.') && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
  } catch {
    return false;
  }
};

export const connection = (redisUrl && (!isRenderInternalRedis(redisUrl) || process.env.RENDER))
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null, // Required for BullMQ
    });

connection.on("error", (error) => {
  console.error("[❌ Redis Connection Error]:", error.message);
});

// Define and export the queue for producing jobs
export const documentQueue = new Queue("document-queue", { connection });

// Define and export queue events to listen to progress/completion globally
export const documentQueueEvents = new QueueEvents("document-queue", { connection });