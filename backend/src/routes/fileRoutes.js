import express from "express";
import multer from "multer";
import { uploadFile, getFilesByUser, deleteFile, ReadFileData } from "../controllers/fileController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
// File filter for GeoJSON, KML
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/geo+json", "application/vnd.google-earth.kml+xml"];
  // Accept the file
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error("Invalid file type. Only GeoJSON and KML are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload GeoJSON or KML (protected)
router.post("/upload", verifyToken, upload.single("file"), uploadFile);

// Get files for a specific user (protected)
router.get("/user/:userId", verifyToken, getFilesByUser);

// Delete a file by ID (protected)
router.delete("/:fileId", verifyToken, deleteFile);

// Read a file by filename
router.get("/:filename",verifyToken, ReadFileData); 

export default router;
