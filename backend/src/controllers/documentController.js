import Document from "../models/Document.js";
import { documentQueue, connection as redisClient } from "../config/queue.js";

// POST /api/upload
export const uploadDocument = async (req, res) => {
  try {
    // 1. Assume file info is already processed (Multer, etc.)
    const { content, retention = "Indefinite" } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Document content is required",
      });
    }

    let expiresAt = null;
    if (retention === "24 Hours") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (retention === "7 Days") {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (retention === "30 Days") {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // 2. Save document in MongoDB with association to the authenticated user
    const document = await Document.create({
      content,
      status: "Pending", // important for tracking async work
      user: req.user._id,
      retention,
      expiresAt,
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

    // 3. Handle Cache Hit: return it instantly, skipping MongoDB (verify user ownership)
    if (cachedDocument) {
      const parsedDoc = JSON.parse(cachedDocument);
      if (parsedDoc.user && parsedDoc.user.toString() === req.user._id.toString()) {
        return res.status(200).json({
          success: true,
          document: parsedDoc,
        });
      }
    }

    // 4. Handle Cache Miss: execute standard MongoDB query scoped to current user
    const document = await Document.findOne({ _id: id, user: req.user._id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized",
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

    // Find only documents belonging to the authenticated user
    const documents = await Document.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments({ user: req.user._id });

    return res.status(200).json({
      success: true,
      documents,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOneAndDelete({ _id: id, user: req.user._id });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized",
      });
    }

    // Delete from Redis cache
    await redisClient.del(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};