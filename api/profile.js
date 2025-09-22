// routes/profile.js
import { connectDB } from "../utils/db.js";
import User from "../models/User.js";
import { verifyToken } from "../utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    await connectDB();

    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(decoded.id).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
