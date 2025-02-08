const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Uncomment this line
const User = require("../models/User");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  console.log("ayush5", req.body);

  const { name, email, location, password } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        details: { email },
      });
    }

    // Hash password before saving
    // const hashedPassword = await bcrypt.hash(password, 10); // Uncomment this line
    // const user = new User({ name, email, password: hashedPassword }); // Use hashed password
    const user = new User({ name, email, location, password });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email },
      expiresIn: 360, // Send expiresIn as a number
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
