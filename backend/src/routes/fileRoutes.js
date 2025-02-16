const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");
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

// Route for uploading GeoJSON, KML
router.post("/upload", upload.single("file"), fileController.uploadFile);

// New route to fetch files by user ID
router.get("/user/:userId", fileController.getFilesByUser);

// delete file by id
router.delete("/:fileId", fileController.deleteFile);

// New route to read file data
router.get("/:filename", fileController.ReadFileData);


module.exports = router;
