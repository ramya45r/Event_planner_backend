import express from "express";
import { createRoom, getEventRooms } from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a new room
router.post("/", protect, createRoom);

// Get all rooms for a specific event
router.get("/:eventId", protect, getEventRooms);

export default router;
