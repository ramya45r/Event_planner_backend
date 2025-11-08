import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = async (req, res) => {
  try {
      console.log(req.body);
    const { name, email, password, role } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    // Optional: exclude the currently logged-in user
    const users = await User.find({ _id: { $ne: req.user.id } }).select("name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = (req, res) => {
  res.json(req.user);
};
