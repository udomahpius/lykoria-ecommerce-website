import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "cloudinary";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// Multer (uploads to /tmp before Cloudinary)
// ============================
const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ============================
// Create Post
// ============================
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lykoria_uploads",
      });
      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    const newPost = new Post({
      ...req.body,
      image: imageUrl,
      author: req.userId, // 👤 store logged-in user
    });

    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// Get Posts (all or user’s own)
// ============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const query = req.userRole === "admin" ? {} : { author: req.userId };
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// Update Post
// ============================
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Only author or admin can update
    if (post.author.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let imageUrl = post.image;
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lykoria_uploads",
      });
      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    Object.assign(post, { ...req.body, image: imageUrl });
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("PUT /api/posts/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// Delete Post
// ============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
