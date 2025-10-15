import express from "express";
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import upload from "../middlewares/upload.js";
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";

const router = express.Router();

// Routes
router.post("/upload", upload.single("file"),protect,authorizeRoles("Admin","HR"), uploadDocument); 
router.get("/",protect, getAllDocuments);
router.get("/:id",protect, getDocumentById);
router.get("/download/:id",protect, downloadDocument);
router.delete("/:id",protect,authorizeRoles("Admin","HR"), deleteDocument);

export default router;