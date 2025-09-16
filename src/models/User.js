import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  phone: String,
  region: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
