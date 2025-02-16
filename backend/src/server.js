const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// // Serve static files from the 'uploads' folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", function (req, res) {
  res.send("Geo-Data App is Running");
});

// Auth routes
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");

app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);  

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
