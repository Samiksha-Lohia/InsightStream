import { Queue } from "bullmq";
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

const connection = (redisUrl && (!isRenderInternalRedis(redisUrl) || process.env.RENDER))
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null,
    });

connection.on("error", (error) => {
  console.error("[❌ checkQueue Redis Connection Error]:", error.message);
});

async function checkQueue() {
  const queue = new Queue("document-queue", { connection });

  try {
    const jobCounts = await queue.getJobCounts();
    console.log("\n--- Queue Job Counts ---");
    console.log(JSON.stringify(jobCounts, null, 2));

    const workers = await queue.getWorkers();
    console.log("\n--- Active Workers ---");
    console.log(`Count: ${workers.length}`);
    workers.forEach((w, idx) => {
      console.log(`Worker ${idx + 1}: ID=${w.id}, Name=${w.name}`);
    });

    const waitingJobs = await queue.getJobs(["waiting"]);
    if (waitingJobs.length > 0) {
      console.log("\n--- Waiting Jobs Sample ---");
      waitingJobs.slice(0, 3).forEach(job => {
        console.log(`Job ID: ${job.id}, Name: ${job.name}, Data: ${JSON.stringify(job.data)}`);
      });
    }

    const activeJobs = await queue.getJobs(["active"]);
    if (activeJobs.length > 0) {
      console.log("\n--- Active Jobs Sample ---");
      activeJobs.slice(0, 3).forEach(job => {
        console.log(`Job ID: ${job.id}, Name: ${job.name}, Progress: ${job.progress}%`);
      });
    }

    const failedJobs = await queue.getJobs(["failed"]);
    if (failedJobs.length > 0) {
      console.log("\n--- Failed Jobs Sample ---");
      failedJobs.slice(0, 3).forEach(job => {
        console.log(`Job ID: ${job.id}, Name: ${job.name}, Failed Reason: ${job.failedReason}`);
      });
    }

  } catch (error) {
    console.error("Error inspecting queue:", error);
  } finally {
    await connection.quit();
  }
}

checkQueue();
