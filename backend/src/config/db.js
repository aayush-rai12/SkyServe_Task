const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection URL
// const mongoURL = process.env.MONGO_URL;
const mongoURL =  process.env.MONGO_URL;

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
