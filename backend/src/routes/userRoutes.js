import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerUser, updateUser, userLogin } from "../controllers/userController.js";
import upload from "../config/multer.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", upload.single("image"), registerUser);

// Login
router.post("/login", userLogin);

// Update Profile (Protected)
router.put('/update/:id', verifyToken, upload.single('image'), updateUser);

export default router;
