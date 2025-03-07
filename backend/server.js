import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import redisClient from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import confessionRoutes from "./routes/confessionRoutes.js";
import secretRoutes from "./routes/messageRoutes.js"; // ✅ Updated Secret Routes

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// ✅ Check Redis Connection
(async () => {
  try {
    await redisClient.ping();
    console.log("✅ Redis is Ready!");
  } catch (error) {
    console.error("❌ Redis Ping Failed:", error);
  }
})();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/confession", confessionRoutes);
app.use("/api/secret", secretRoutes); // ✅ Added Secret Message API

// Default Route
app.get("/", (req, res) => {
  res.send("🔥 Authentication & Secret Message API is Running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
