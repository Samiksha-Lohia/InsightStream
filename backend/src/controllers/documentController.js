import Document from "../models/Document.js";
import { documentQueue, connection as redisClient } from "../config/queue.js";

export const uploadDocument = async (req, res) => {
  try {
    // 1. Assume file info is already processed (Multer, etc.)
    const { content } = req.body;

    // 2. Save document in MongoDB
    const document = await Document.create({
      content,
      status: "Pending", // important for tracking async work
    });

    // 3. Push job to Redis queue
    await documentQueue.add("process-document", {
      documentId: document._id.toString(),
    });

    // 4. Respond immediately (ASYNC ACK)
    return res.status(202).json({
      success: true,
      message: "Document uploaded successfully. Processing started.",
      documentId: document._id,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

// GET /api/documents/:id
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 2. The Cache Check: Check if document exists in Redis memory
    const cachedDocument = await redisClient.get(id);

    // 3. Handle Cache Hit: return it instantly, skipping MongoDB
    if (cachedDocument) {
      return res.status(200).json({
        success: true,
        document: JSON.parse(cachedDocument),
      });
    }

    // 4. Handle Cache Miss: execute standard MongoDB query
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Store a stringified copy in Redis with TTL of 3600 seconds, ONLY for terminal states
    if (document.status === "Completed" || document.status === "Failed") {
      await redisClient.set(id, JSON.stringify(document), "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/documents
export const getAllDocuments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments();

    return res.status(200).json({
      success: true,
      documents,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};