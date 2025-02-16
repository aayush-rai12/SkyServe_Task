const express = require("express");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userController = require("../controllers/userController");
const upload = require('../config/multer');
const router = express.Router();

// Register

router.post('/register', upload.single('image'), userController.registerUser);

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
        details: { email },
      });
    }
    console.log("User:", user);
    // Compare password with the hashed password in the database
    // const isMatch = await bcrypt.compare(password, user.password); // Uncomment this line
    if (password !== user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid user password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        image: user.image,
      },
      expiresIn: 360,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
