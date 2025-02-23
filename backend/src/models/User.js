import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    url: { type: String }, // Cloudinary image URL
    public_id: { type: String }, // Cloudinary public ID
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);
export default User;