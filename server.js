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


// Routes
// import router from "./routes/postRoutes.js";
// app.use("/api", router);

import User from "./models/User.js";

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

// ============================
// CORS Config
// ============================
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  process.env.FRONTEND_URL, // hosted frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy does not allow access from this origin."), false);
  },
  credentials: true,
}));

// ✅ Fix preflight requests for all paths
app.options(/.*/, cors());

// ============================
// Multer (for file uploads)
// ============================
const upload = multer({ dest: "/tmp", limits: { fileSize: 5 * 1024 * 1024 } });

// ============================
// MongoDB Connection
// ============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));




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

// Health check
app.get("/", (req, res) => res.send("✅ Server is alive"));

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, region } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      phone,
      region,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
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

// Profile
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get("/api/categories", (req, res) => {
  const categories = [
    { key: "health", label: "Health" },
    { key: "sports", label: "Sports" },
    { key: "business", label: "Business" },
    { key: "education", label: "Education" },
    { key: "entertainment", label: "Entertainment" },
    { key: "lifestyle", label: "Lifestyle" },
    { key: "politics", label: "Politics" },
    { key: "travel", label: "Travel" },
  ];
  res.json(categories);
});

// Post routes
// import authRoutes from "./routes/authRoutes.js"; // adjust path
// app.use("/api", authRoutes);

// ============================
// Start Server
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
