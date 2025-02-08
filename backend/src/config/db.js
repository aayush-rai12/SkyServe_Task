const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection URL
// const mongoURL = process.env.MONGO_URL;
const mongoURL =  process.env.MONGO_URL ||
  "mongodb+srv://ayushwrk1212:3y0V4t1HfHb6N4dL@cluster0.wjvx8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(mongoURL);

// Get the default connection
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

module.exports = mongoose;
