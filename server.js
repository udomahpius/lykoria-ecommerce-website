// ============================
// Imports
// ============================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================
// Initialize App
// ============================
const app = express();

// ============================
// Config
// ============================
const PORT = 5000;
const SECRET_KEY = "mySuperSecretKey"; // Change in production
const MONGO_URI = "mongodb+srv://udomahpius5_db_user:gNmCmbs3buf28cwt@adminblog.e52cozo.mongodb.net/blogDB";

// ============================
// Ensure uploads folder exists
// ============================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("✅ Created uploads folder");
}

// ============================
// Middleware
// ============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const corsOptions = {
  origin: "http://127.0.0.1:5500",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// ============================
// Multer: File Uploads
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve uploaded images
app.use("/uploads", express.static(uploadsDir));

// ============================
// MongoDB Connection
// ============================
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ============================
// Schemas
// ============================
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  phone: String,
  region: String
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
  createdAt: { type: Date, default: Date.now }
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

// Create Post
app.post("/api/posts", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const postData = req.body;
    postData.image = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : "";

    const newPost = new Post(postData);
    await newPost.save();

    res.json({ success: true, data: newPost });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Post
app.put("/api/posts/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const postData = req.body;

    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) return res.status(404).json({ success: false, error: "Post not found" });

    if (req.file) {
      postData.image = `http://localhost:${PORT}/uploads/${req.file.filename}`;

      // Delete old image if exists
      if (existingPost.image) {
        const oldImagePath = path.join(__dirname, "uploads", path.basename(existingPost.image));
        fs.unlink(oldImagePath, err => {
          if (err) console.warn("Old image deletion failed:", err.message);
        });
      }
    } else {
      postData.image = existingPost.image || "";
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, postData, { new: true });
    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error("PUT /api/posts/:id error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Posts
app.get("/api/posts", async (req, res) => {
  try {
    const { category, limit } = req.query;
    let query = {};
    if (category) query.category = category;

    let postsQuery = Post.find(query).sort({ createdAt: -1 });
    if (limit) postsQuery = postsQuery.limit(parseInt(limit));

    const posts = await postsQuery.exec();
    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Post
app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ success: false, error: "Post not found" });

    // Delete image file if exists
    if (deletedPost.image) {
      const imagePath = path.join(__dirname, "uploads", path.basename(deletedPost.image));
      fs.unlink(imagePath, err => {
        if (err) console.warn("Image deletion failed:", err.message);
      });
    }

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts/:id error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// Start Server
// ============================
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
