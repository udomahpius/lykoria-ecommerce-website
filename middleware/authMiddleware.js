import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "mySuperSecretKey";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.userId = decoded.id;
    req.userRole = decoded.role || "user"; // support roles
    next();
  });
}
