import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: String,
    urlText: String,
    category: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
