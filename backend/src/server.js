import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import path from "path";
// import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"; 
import fileRoutes from "./routes/fileRoutes.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// const PORT = 'mongodb+srv://ayushwrk1212:GJoIUecaZqA0k8kb@cluster0.z34gw.mongodb.net/'

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Geo-Data App is Running");
});


app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
