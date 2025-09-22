import jwt from "jsonwebtoken";

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: "1h" });
}

export function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch {
    return null;
  }
}

