import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
// import multersetup from "../config/multer.js";

// Register User with Image Upload
export const registerUser = async (req, res) => {
  console.log("Request body: test");
  try {
    const { name, email, location, password } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    // Check if file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.file.path, "user_images"); 

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with Cloudinary image details
    const user = new User({
      name,
      email,
      location,
      password: hashedPassword,
      image: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });

    // Save user details into database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({id: user._id,},process.env.JWT_SECRET,{expiresIn: "3600",});

    // Respond with success message and user data
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        name: user.name,
        email: user.email,
        image: user.image.url,
      },
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Login User
export const userLogin = async (req, res) => {
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid user password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: "3600s",});
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
      expiresIn: 3600,
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
};

//update user profile
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, location } = req.body;
  console.log("User file:", req.file);

  try {
    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.location = location || user.location;
    // Now Going to handle image upload part
    if (req.file) {
      // Delete the old image from Cloudinary if it exists
      if (user.image.public_id) {
        await deleteImage(user.image.public_id);
        console.log("Deleting old image from Cloudinary");
      }

      // Upload new image to Cloudinary
      const uploadResult = await uploadImage(req.file.path, "user_images");

      // Update the users image details
      user.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Save the updated user to the database
    await user.save();

    // Return the updated user data
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
