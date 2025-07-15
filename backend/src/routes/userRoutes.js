import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerUser, updateUser, userLogin } from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

// Register
router.post("/register", upload.single("image"), registerUser);

router.post("/login", userLogin);

// Update User Profile
router.put('/update/:id', upload.single('image'), updateUser);

export default router;
