import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import fs from "fs";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------
// Multer for file uploads
// ------------------------------
const upload = multer({ dest: "/tmp" });

// ------------------------------
// CREATE POST
// ------------------------------
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lykoria_posts",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // cleanup tmp file
    }

    const { title, body, url, urlText, category, status } = req.body;

    const newPost = new Post({
      title,
      body,
      url,
      urlText,
      category,
      status: status || "draft",
      image: imageUrl,
      user: req.user.id, // save user from authMiddleware
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, status, limit } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // newest first
      .limit(parseInt(limit) || 0);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// DELETE POST
// ------------------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "✅ Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
