// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
const uploadImage = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png'],
    });
    return result; // Return the result object which contains the image URL and other data
  } catch (error) {
    console.error('Error uploading to Cloudinary', error);
    throw error; // Rethrow error if upload fails
  }
};

module.exports = { cloudinary, uploadImage };