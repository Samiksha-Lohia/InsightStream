import { documentQueue, documentQueueEvents } from "../config/queue.js";

export const initSocketListeners = (io) => {
  documentQueueEvents.on("progress", async ({ jobId, data: progress }) => {
    try {
      const job = await documentQueue.getJob(jobId);
      if (job && job.name === "process-document") {
        console.log(`[🔌 WebSocket] Broadcasting progress: Job ${jobId} is ${progress}% complete`);
        io.emit("progress", {
          documentId: job.data.documentId,
          progress: progress,
        });
      }
    } catch (err) {
      console.error("[🔌 WebSocket] Error fetching job for progress event:", err);
    }
  });

  documentQueueEvents.on("completed", async ({ jobId }) => {
    try {
      const job = await documentQueue.getJob(jobId);
      if (job && job.name === "process-document") {
        console.log(`[🔌 WebSocket] Broadcasting completion: Job ${jobId} completed`);
        io.emit("progress", {
          documentId: job.data.documentId,
          progress: 100,
          status: "Completed",
        });
      }
    } catch (err) {
      console.error("[🔌 WebSocket] Error fetching job for completed event:", err);
    }
  });
};