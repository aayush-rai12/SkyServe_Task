import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

// MongoDB connection w
const mongoURL = process.env.MONGO_URL_atlas;
// const mongoURL = process.env.DB_URL;

// Connect to MongoDB
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  logger.info("Connected to MongoDB server");
});

db.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
  logger.info("MongoDB disconnected. Exiting process...");
});

export default mongoose;
