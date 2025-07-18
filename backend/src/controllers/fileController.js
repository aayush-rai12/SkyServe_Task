import File from "../models/File.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

// Validate GeoJSON data
const isValidGeoJSON = (geojson) => {
  if (!geojson || typeof geojson !== "object") {
    return false;
  }

  const validTypes = [
    "FeatureCollection",
    "Feature",
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
    "GeometryCollection",
  ];

  // Check if the type is valid or not
  if (!geojson.type || !validTypes.includes(geojson.type)) {
    return false;
  }

  // Validate FeatureCollection
  if (geojson.type === "FeatureCollection") {
    // features must be an array
    if (!Array.isArray(geojson.features)) {
      return false;
    }

    // Validate each feature in the FeatureCollection
    for (const feature of geojson.features) {
      // Invalid feature
      if (!isValidGeoJSON(feature)) {
        return false;
      }
    }
  }

  // Validate Feature
  if (geojson.type === "Feature") {
    // Invalid geometry
    if (!geojson.geometry || !isValidGeoJSON(geojson.geometry)) {
      return false;
    }
  }

  // Validate Geometry Objects (Point, LineString, Polygon, etc.)
  if (
    [
      "Point",
      "LineString",
      "Polygon",
      "MultiPoint",
      "MultiLineString",
      "MultiPolygon",
    ].includes(geojson.type)
  ) {
    // check coordinates is array or not  array
    if (!Array.isArray(geojson.coordinates)) {
      return false;
    }
  }

  return true;
};

// Sanitize filename to prevent directory traversal
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
};

export const uploadFile = async (req, res) => {
  try {
    
    //current directory using import.meta.url
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, "..", "uploads", "geoJsonFiles");


    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (req.file) {
      const uploadedFile = req.file;

      // Save the file info to the database
      const newFile = new File({
        user: req.body.user ? req.body.user._id : null,
        name: uploadedFile.originalname,
        type: uploadedFile.mimetype,
        path: uploadedFile.path,
      });

      await newFile.save();

      logger.info(`File uploaded: ${newFile.name} by user ${newFile.user}`);

      return res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: newFile._id,
          name: newFile.name,
          type: newFile.type,
          path: newFile.path,
          user: newFile.user,
        },
      });
    }

    // Check for GeoJSON data
    let geojsonData = req.body.geojson || req.body.geoJSONData || req.body;
    let UploadedFileName = req.body.fileName || "geojson-file.geojson";

    if (geojsonData) {
      // Convert string to object
      if (typeof geojsonData === "string") {
        try {
          geojsonData = JSON.parse(geojsonData);
        } catch (error) {
          return res
            .status(400)
            .json({ message: "Invalid GeoJSON data format" });
        }
      }

      // Validate GeoJSON structure manually
      if (!isValidGeoJSON(geojsonData)) {
        return res.status(400).json({ message: "Invalid GeoJSON structure" });
      }

      // Sanitize filename
      const safeFileName = sanitizeFilename(UploadedFileName);
      const filePath = path.join(uploadsDir, `${Date.now()}-${safeFileName}`);

      // Save GeoJSON data to file
      try {
        fs.writeFileSync(filePath, JSON.stringify(geojsonData));
      } catch (error) {
        logger.error("Failed to save GeoJSON file: " + error.message);
        return res.status(500).json({ message: "Failed to save GeoJSON file" });
      }

      // Save file info to the database
      const newFile = new File({
        user: req.body.user ? req.body.user._id : null,
        name: safeFileName,
        type: "application/geo+json",
        path: filePath,
      });

      await newFile.save();

      logger.info(`GeoJSON data saved: ${newFile.name} by user ${newFile.user}`);

      return res.status(201).json({
        message: "GeoJSON data saved successfully",
        file: {
          id: newFile._id,
          name: newFile.name,
          type: newFile.type,
          path: newFile.path,
          user: newFile.user,
        },
      });
    }

    return res
      .status(400)
      .json({ message: "No file or GeoJSON data uploaded" });
  } catch (error) {
    logger.error("Error in uploadFile: " + error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// getting files by user
export const getFilesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cleanedUserId = userId.startsWith(":") ? userId.slice(1) : userId;
    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(cleanedUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    // Fetch files for the specified user
    const response = await File.find({ user: cleanedUserId });

    // Send the response
    logger.info(`Fetched files for user: ${cleanedUserId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getFilesByUser: " + error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// delete function
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Find the file in the database
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Get the file path
    const filePath = file.path; // Adjust the path as needed

    // Check if the file exists physically
    if (fs.existsSync(filePath)) {
      // Delete the file from the file system
      fs.unlinkSync(filePath);
    } 

    // Delete the file from the database
    await File.findByIdAndDelete(fileId);
    logger.info(`File deleted: ${fileId}`);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteFile: " + error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Read file data
export const ReadFileData = async (req, res) => {
  try {
    // Calculate the current directory using import.meta.url
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(
      __dirname,
      "../uploads/geoJsonFiles",
      req.params.filename
    );
    const data = await fs.promises.readFile(filePath, "utf8");
    logger.info(`File read: ${req.params.filename}`);
    res.json({ data });
  } catch (error) {
    // Handle specific errors
    if (error.code === "ENOENT") {
      logger.error("File not found: " + error.message);
      return res.status(404).json({ error: "File not found" });
    }
    logger.error("Error in ReadFileData: " + error.message);
    res.status(500).json({ message: "Server error" });
  }
};
