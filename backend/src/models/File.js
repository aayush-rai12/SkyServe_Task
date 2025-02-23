import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
});

const File = mongoose.model("File", fileSchema);
export default File;
