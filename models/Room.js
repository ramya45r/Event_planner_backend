import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "General Chat",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Optionally populate participants when fetching
roomSchema.pre(/^find/, function (next) {
  this.populate("participants", "name email role");
  next();
});

export default mongoose.model("Room", roomSchema);
