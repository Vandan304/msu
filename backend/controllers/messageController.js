import { SecretMessage } from "../models/message.js";
import bcrypt from "bcryptjs";
import redisClient from "../config/redis.js";
import crypto from "crypto";

// ✅ POST: Create a Secret Message & Store in Redis
export const createSecretMessage = async (req, res) => {
  try {
    const { message, password } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Generate a unique key
    const key = crypto.randomBytes(8).toString("hex");

    // Create and save in MongoDB
    const newMessage = new SecretMessage({ message, password: hashedPassword, key });
    await newMessage.save();

    // Store in Redis (expires in 24 hours)
    const messageData = { key, message, password: hashedPassword };
    await redisClient.setEx(newMessage._id.toString(), 86400, JSON.stringify(messageData));

    res.status(201).json({
      message: "Secret message created successfully!",
      id: newMessage._id,
      key, // Send key for retrieval
    });
  } catch (error) {
    console.error("❌ Error creating message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ GET: Retrieve & Delete a Secret Message (One-Time Read)
export const getSecretMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, password } = req.body;

    // Validate ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid message ID format" });
    }

    // Try to get the message from Redis first
    let secretMessage = await redisClient.get(id);
    if (secretMessage) {
      secretMessage = JSON.parse(secretMessage);
    } else {
      // If not found in Redis, check MongoDB
      secretMessage = await SecretMessage.findById(id);
      if (!secretMessage) return res.status(404).json({ error: "Message not found or already deleted" });
    }

    // Validate the key
    if (secretMessage.key !== key) {
      return res.status(403).json({ error: "Invalid key" });
    }

    // Validate the password if required
    if (secretMessage.password) {
      if (!password) return res.status(401).json({ error: "Password required" });
      const isMatch = await bcrypt.compare(password, secretMessage.password);
      if (!isMatch) return res.status(403).json({ error: "Incorrect password" });
    }

    // Store message content before deletion
    const messageContent = secretMessage.message;

    // Delete from MongoDB & Redis (One-Time Read)
    await SecretMessage.findByIdAndDelete(id);
    await redisClient.del(id);

    res.status(200).json({ message: messageContent });
  } catch (error) {
    console.error("❌ Error retrieving message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
