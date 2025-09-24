import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "cloudinary";
import crypto from "crypto";   // ✅ missing
import Post from "../models/Post.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ------------------------------
// Multer
// ------------------------------
const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ------------------------------
// Nodemailer Transport
// ------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------------------
// Request Password Reset (keep only one flow!)
// ------------------------------
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.CLIENT_URL}/pages/new-password.html?token=${token}`;

    await transporter.sendMail({
      from: `"Lykoria Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Hi ${user.firstName},</p>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    res.json({ message: "✅ Reset link sent to email" });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------
// Reset Password
// ------------------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.passwordHash = hashed;  // ✅ FIX
    await user.save();

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
