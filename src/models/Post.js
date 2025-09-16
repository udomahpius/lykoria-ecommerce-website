import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  url: String,
  urlText: String,
  category: String,
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
