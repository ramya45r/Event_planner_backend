import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { queueEventReminder } from "../queues/eventQueue.js";
import Notification from "../models/Notification.js";

/**
 * Create event:
 * - Save attachments to Cloudinary
 * - Create Event document
 * - Schedule reminder job 1 hour before start
 */
export const createEvent = async (req, res) => {
  try {
    console.log(req.body, "hh");

    const { title, description, category, startTime, endTime, location } =
      req.body;
    console.log(req.body, "kkk");
    const attachments = [];

    if (req.files && req.files.length) {
      for (const f of req.files) {
        const resCloud = await cloudinary.uploader.upload(f.path, {
          folder: "edentu/events",
        });
        console.log(resCloud, "resCloud");

        attachments.push({
          url: resCloud.secure_url,
          public_id: resCloud.public_id,
        });
        try {
          fs.unlinkSync(f.path);
        } catch (e) {}
      }
    }
    console.log("kkkkaaa");

    const event = await Event.create({
      title,
      description,
      category,
      startTime,
      endTime,
      organizer: req.user._id,
      participants: [],
      location,
      attachments,
    });

    console.log("Event created:", event._id);

    try {
      await queueEventReminder(event._id, new Date(startTime));
      console.log("✅ Reminder scheduled from controller");
    } catch (err) {
      console.error("Error in queueEventReminder:", err.message);
    }

    try {
      await Notification.create({
        user: req.user._id,
        type: "event_created",
        message: `Event "${title}" created.`,
        data: { eventId: event._id },
      });
      console.log("Notification created");
    } catch (err) {
      console.error("Error creating notification:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, q, filter } = req.query;
    const skip = (page - 1) * limit;
    const query = {};
    if (q) query.$text = { $search: q };
    // filter upcoming/ongoing/completed
    const now = new Date();
    if (filter === "upcoming") query.startTime = { $gt: now };
    if (filter === "ongoing") query.startTime = { $lte: now }; // extra check endTime > now
    if (filter === "completed") query.endTime = { $lt: now };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("organizer", "name email");
    res.json({ total, page: Number(page), perPage: Number(limit), events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const e = await Event.findById(req.params.id).populate(
      "organizer participants.user",
      "name email role"
    );
    if (!e) return res.status(404).json({ message: "Not found" });
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });

    // Only organizer or admin can update (middleware already checks role; additional check: organizer owner)
    if (
      req.user.role !== "Admin" &&
      String(event.organizer) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // cloud upload new files if any
    if (req.files && req.files.length) {
      for (const f of req.files) {
        const resCloud = await cloudinary.uploader.upload(f.path, {
          folder: "edentu/events",
        });
        event.attachments.push({
          url: resCloud.secure_url,
          public_id: resCloud.public_id,
        });
        try {
          fs.unlinkSync(f.path);
        } catch (e) {}
      }
    }

    const fields = [
      "title",
      "description",
      "category",
      "startTime",
      "endTime",
      "location",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();

    // optionally re-schedule reminder if startTime changed
    await queueEventReminder(event._id, new Date(event.startTime));

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: "Not found" });

    await ev.deleteOne(); // <-- use deleteOne instead of remove
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const rsvp = async (req, res) => {
  try {
    const { id } = req.params; // Event ID
    const { status, userId } = req.body; // "accepted" or "declined"

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // ✅ Ensure arrays exist
    if (!event.participants) event.participants = [];
    if (!event.invited) event.invited = [];

    const participantId = userId || req.user._id;
console.log(participantId,'participantId');

    // Find participant index (if exists)
    const existingIndex = event.participants.find(
      (p) => String(p._id) === String(participantId)
    );
    console.log(existingIndex, "existing index1");

    if (status === "accepted") {
      existingIndex.status = "accepted";
      await event.save();
    } else if (status === "declined") {
   event.participants = event.participants.find(
  (p) => String(p._id) !== String(participantId)
);
console.log(event.participants,'kk');


      
    await event.save();

      console.log("❌ Participant declined:", participantId);
    }

    // Save the event
    await event.save();

    res.json({
      success: true,
      participants: event.participants,
      invited: event.invited,
    });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const inviteParticipants = async (req, res) => {
  try {
    const { id } = req.params; // Event ID
    const { participants } = req.body; // Array of user IDs

    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Participants must be an array" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Filter out users already invited
    const newParticipants = participants.filter(
      (p) => !event.participants.includes(p)
    );

    if (newParticipants.length === 0) {
      return res
        .status(400)
        .json({ message: "All selected users are already invited" });
    }

    // Push new participants
    event.participants.push(...newParticipants);
    await event.save();

    // Optionally populate for frontend convenience
    const updatedEvent = await Event.findById(id).populate(
      "participants",
      "name email"
    );

    res.json({
      message: "Participants invited successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Invite error:", err);
    res
      .status(500)
      .json({ message: "Server error while inviting participants" });
  }
};
