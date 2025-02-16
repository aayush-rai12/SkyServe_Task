// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadImage } = require('../config/cloudinary');

// Register User with Image Upload
exports.registerUser = async (req, res) => {
  try {
    const { name, email, location, password } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.file.path, 'user_images'); // 'user_images' is the folder in Cloudinary

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with Cloudinary image details
    const user = new User({
      name,
      email,
      location,
      password,
      image: {
        url: uploadResult.secure_url, // Cloudinary image URL
        public_id: uploadResult.public_id, // Cloudinary public ID
      },
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success message and user data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        name: user.name,
        email: user.email,
        image: user.image.url,
      },
      token,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};