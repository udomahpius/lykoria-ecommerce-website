// ============================
// Imports
// ============================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

// Import routes
import authRoutes from "./routes/authRoutes.js";   // signup, login, reset-password, profile
import postRoutes from "./routes/postRoutes.js";   // posts CRUD

dotenv.config();

// ============================
// Initialize App
// ============================
const app = express();

// ============================
// Config
// ============================
const PORT = process.env.PORT || 5000;
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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(
        new Error("CORS policy does not allow access from this origin."),
        false
      );
    },
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options(/.*/, cors());

// ============================
// MongoDB Connection
// ============================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================
// Routes
// ============================

// Health check
app.get("/", (req, res) => res.send("✅ Server is alive"));

// Use route files
app.use("/api", authRoutes);       // signup, login, reset-password, profile, categories
app.use("/api/posts", postRoutes); // post CRUD (upload, list, delete, etc.)

// ============================
// Start Server
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
