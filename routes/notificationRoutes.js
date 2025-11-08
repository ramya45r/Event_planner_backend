import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments({ user: req.user._id });
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json({ total, page, perPage: limit, items });
});

router.post("/:id/read", protect, async (req, res) => {
  const n = await Notification.findById(req.params.id);
  if (!n || String(n.user) !== String(req.user._id)) return res.status(404).json({ message: "Not found" });
  n.read = true;
  await n.save();
  res.json({ ok: true });
});

export default router;
