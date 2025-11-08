import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    attachments: [
      {
        type: String, // could store file URL or Cloudinary path
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
