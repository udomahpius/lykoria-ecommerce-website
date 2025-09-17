// ============================
// Imports
// ============================
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ============================
// Initialize App
// ============================
const app = express();

// ============================
// Config
// ============================
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "mySuperSecretKey";
const MONGO_URI = process.env.MONGO_URI;

// ============================
// Cloudinary Config
// ============================
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================
// Middleware
// ============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "*",
    "https://admin-blog-mauve.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// ============================
// Multer: File Uploads (temporary directory)
// ============================
const upload = multer({ dest: "tmp", limits: { fileSize: 5 * 1024 * 1024 } });

// ============================
// MongoDB Connection
// ============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================
// Schemas
// ============================
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  phone: String,
  region: String,
});
const User = mongoose.model("User", UserSchema);

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
const Post = mongoose.model("Post", PostSchema);

// ============================
// Auth Middleware
// ============================
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// ============================
// Routes
// ============================

// Test route
app.get("/", (req, res) => res.send("Server is alive"));

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, region } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, passwordHash, phone, region });
    await newUser.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Profile
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// POSTS
// ============================

// Create Post with Cloudinary Upload
app.post("/api/posts", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: "lykoria_uploads" });
      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    const newPost = new Post({ ...req.body, image: imageUrl });
    await newPost.save();

    res.json({ success: true, data: newPost });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Post with Cloudinary Upload
app.put("/api/posts/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) return res.status(404).json({ success: false, error: "Post not found" });

    let imageUrl = existingPost.image;

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: "lykoria_uploads" });
      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { ...req.body, image: imageUrl }, { new: true });

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error("PUT /api/posts/:id error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Posts
app.get("/api/posts", async (req, res) => {
  try {
    const { category, limit, status } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    let postsQuery = Post.find(query).sort({ createdAt: -1 });
    if (limit) postsQuery = postsQuery.limit(parseInt(limit));

    const posts = await postsQuery.exec();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Post
app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ success: false, error: "Post not found" });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts/:id error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// Start Server
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
