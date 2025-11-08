import pkg from "bullmq";
const { Queue, Worker } = pkg;
import { createClient } from "redis";
import Notification from "../models/Notification.js";
import Event from "../models/Event.js";

// ✅ Redis connection setup
const connection = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

connection.on("error", (err) => console.error("❌ Redis error:", err));

// ✅ Connect and initialize both Queue + Worker immediately
await connection.connect();
console.log("✅ Redis connected for event queue");

// Create queue (for scheduling jobs)
export const eventQueue = new Queue("event-reminders", { connection });

// Create worker (to process jobs)
new Worker(
  "event-reminders",
  async (job) => {
    console.log("🎯 Job picked up:", job.id);

    const { eventId } = job.data;
    const event = await Event.findById(eventId).populate(
      "organizer participants.user",
      "name email"
    );

    if (!event) {
      console.warn(`⚠️ Event ${eventId} not found`);
      return;
    }

    const message = `Reminder: Your event "${event.title}" starts at ${new Date(
      event.startTime
    ).toLocaleString()}`;

    const usersToNotify = [
      event.organizer,
      ...event.participants.map((p) => p.user),
    ];

    await Promise.all(
      usersToNotify.map((u) =>
        Notification.create({
          user: u._id || u,
          type: "reminder",
          message,
          data: { eventId },
        })
      )
    );

    console.log(`✅ Reminder sent for "${event.title}"`);
  },
  { connection }
);

// ✅ Function to schedule reminders
export const queueEventReminder = async (eventId, startTime) => {
  console.log("🧠 queueEventReminder called with:", eventId, startTime);

  const eventTime = new Date(startTime).getTime();
  const remindAt = eventTime - 10 * 60 * 1000; // 10 min before event
  const delay = remindAt - Date.now();

  console.log({
    now: new Date().toISOString(),
    eventTime: new Date(eventTime).toISOString(),
    remindAt: new Date(remindAt).toISOString(),
    delay
  });

  if (delay <= 0) {
    console.log(`⚠️ Skipping reminder (event already started or too close)`);
    return;
  }

  await eventQueue.add("sendReminder", { eventId }, { delay });
  console.log(`✅ Reminder scheduled in ${Math.round(delay / 1000)} sec`);
};

