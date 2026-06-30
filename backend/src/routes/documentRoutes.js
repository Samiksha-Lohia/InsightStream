import express from "express";
import {
  uploadDocument,
  getDocumentById,
  getAllDocuments,
} from "../controllers/documentController.js";

const router = express.Router();
router.post("/upload", uploadDocument);
router.get("/documents", getAllDocuments);
router.get("/documents/:id", getDocumentById);

export default router;