import ChatMessage from "../models/ChatMessage.js";
import Room from "../models/Room.js";

// Get all messages for a given event
export const getMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const room = await Room.findOne({ eventId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const messages = await ChatMessage.find({ roomId: room._id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { text, roomId } = req.body;
    const userId = req.user._id;

    if (!text || !roomId) {
      return res.status(400).json({ message: "Text and roomId are required" });
    }

    const msg = await ChatMessage.create({
      roomId,
      sender: userId,
      message: text,
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
