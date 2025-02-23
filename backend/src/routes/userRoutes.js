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

// Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     // Check if the user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//         details: { email },
//       });
//     }
//     console.log("User:", user);
//     // Compare password with the hashed password in the database
//     if (password !== user.password) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user password",
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "3600s",
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         location: user.location,
//         image: user.image,
//       },
//       expiresIn: 3600,
//       token: token,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

router.post("/login", userLogin);

// Update User Profile
router.put('/update/:id', upload.single('image'), updateUser);

export default router;
