import Room from "../models/Room.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

export const createRoom = async (req, res) => {
        console.log(req.params,'kk');

  try {
    const { eventId, name, participants } = req.body;

    // Ensure event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate participants (optional)
    if (participants && participants.length > 0) {
      const users = await User.find({ _id: { $in: participants } });
      if (users.length !== participants.length) {
        return res.status(400).json({ message: "Invalid participants" });
      }
    }

    // Create room
    const newRoom = await Room.create({
      eventId,
      name: name || `${event.title} Chat`,
      participants: participants?.length ? participants : [req.user._id],
    });

    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventRooms = async (req, res) => {
    
  try {
    const { eventId } = req.params;
    const rooms = await Room.find({ eventId }).populate("participants", "name email role");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
