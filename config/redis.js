// backend/config/redis.js
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// ----------------------
// Redis Connection Setup
// ----------------------
export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// ----------------------
// Optional: Direct Redis Client
// ----------------------
export const redisClient = createClient({
  socket: {
    host: redisConnection.host,
    port: redisConnection.port,
  },
  password: redisConnection.password,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

// Connect when the app starts
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();
