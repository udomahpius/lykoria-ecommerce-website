import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone:     { type: String },
  region:    { type: String },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
