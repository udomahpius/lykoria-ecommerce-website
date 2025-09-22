import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  url: String,
  urlText: String,
  category: String,
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👤 link to user
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
