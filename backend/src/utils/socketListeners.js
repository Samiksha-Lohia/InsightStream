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

  documentQueueEvents.on("completed", async ({ jobId, returnvalue }) => {
    try {
      let documentId;
      if (returnvalue) {
        const parsed = typeof returnvalue === "string" ? JSON.parse(returnvalue) : returnvalue;
        documentId = parsed.documentId;
      }

      // Fallback: Query BullMQ if returnvalue parsing fails or is empty
      if (!documentId) {
        const job = await documentQueue.getJob(jobId);
        if (job && job.name === "process-document") {
          documentId = job.data.documentId;
        }
      }

      if (documentId) {
        console.log(`[🔌 WebSocket] Broadcasting completion: Document ID ${documentId}`);
        io.emit("progress", {
          documentId: documentId,
          progress: 100,
          status: "Completed",
        });
      }
    } catch (err) {
      console.error("[🔌 WebSocket] Error during completed event broadcasting:", err);
    }
  });
};