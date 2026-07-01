import express from "express";
import {
  uploadDocument,
  getDocumentById,
  getAllDocuments,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/upload", protect, uploadDocument);
router.get("/documents", protect, getAllDocuments);
router.get("/documents/:id", protect, getDocumentById);

export default router;