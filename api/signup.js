import bcrypt from "bcryptjs";
import User from "../models/User.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { firstName, lastName, email, password, phone, region, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      region,
      role: role.toLowerCase() // admin or user
    });

    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
