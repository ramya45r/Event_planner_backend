import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token received" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};
