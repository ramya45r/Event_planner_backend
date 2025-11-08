import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["invited", "accepted", "declined"], default: "invited" }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  category: String,
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [attendeeSchema],
  location: String,
  attachments: [{ url: String, public_id: String }],
  createdAt: { type: Date, default: Date.now }
});

eventSchema.index({ title: "text", description: "text", category: "text", location: "text" });

export default mongoose.model("Event", eventSchema);
