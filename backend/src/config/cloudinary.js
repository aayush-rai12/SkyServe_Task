import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import logger from '../utils/logger.js'; // Adjust the import based on your logger configuration

dotenv.config();

// setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
export const uploadImage = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png'],
    });
    return result;
  } catch (error) {
    logger.error('Error uploading to Cloudinary', error);
    throw error;
  }
};

// Function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Error deleting from Cloudinary', error);
    throw error;
  }
};

export { cloudinary };