import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "cloudinary";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";
// routes/auth.js (signup route)
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import nodemailer from "nodemailer";





const router = express.Router();


// ============================
// Multer (uploads to /tmp before Cloudinary)
// ============================
const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});




// ------------------------------
// 📌 Setup Nodemailer Transport
// ------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail", // or use your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------------------
// 📌 Request Password Reset
// ------------------------------
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token valid for 15 mins
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Build reset link
    const resetLink = `${process.env.CLIENT_URL}/pages/new-password.html?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: `"Lykoria Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Hi ${user.firstName},</p>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    res.json({ message: "✅ Reset link sent to email" });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------
// 📌 Reset Password
// ------------------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hash new password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


  // === Forgot Password ===
router.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Reset link (frontend page)
    const resetLink = `https://lykoria-ecommerce-website.vercel.app/pages/reset-password.html?token=${resetToken}&email=${email}`;
    // replace with your deployed frontend URL

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use smtp.ethereal.email for testing
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Lykoria" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
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


// routes/signup.js


// ===== Signup =====
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, region, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      region,
      role: role || "user", // 👈 default user if nothing selected
    });

    await newUser.save();

    // JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Signup successful",
      token,
      role: newUser.role,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/auth.js (login route)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;