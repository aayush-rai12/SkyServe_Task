import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection w
const mongoURL = process.env.MONGO_URL_atlas;
// const mongoURL = process.env.DB_URL;

// Connect to MongoDB
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB server");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected. Exiting process...");
});

export default mongoose;
