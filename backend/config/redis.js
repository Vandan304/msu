import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD || undefined, // Authenticate only if password exists
});

redisClient.on("error", (err) => console.error("❌ Redis Connection Error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis Successfully!");

    // ✅ Ping Redis AFTER authentication
    const pong = await redisClient.ping();
    console.log("✅ Redis Ping Response:", pong); // Should print 'PONG'
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
    process.exit(1);
  }
})();

export default redisClient;
