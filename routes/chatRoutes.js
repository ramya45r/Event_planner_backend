import express from "express";
import { getMessages, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get messages for an event
router.get("/:eventId/messages", protect, getMessages);

// Send message
router.post("/:eventId/messages", protect, sendMessage);

export default router;
