import { SecretMessage } from "../models/message.js";
import bcrypt from "bcryptjs";
import redisClient from "../config/redis.js";

// ✅ POST: Create a Secret Message
export const createSecretMessage = async (req, res) => {
  try {
    const { message, password } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newMessage = new SecretMessage({ message, password: hashedPassword });
    await newMessage.save();

    // Store in Redis for quick access
    await redisClient.setEx(newMessage._id.toString(), 86400, JSON.stringify(newMessage)); // Expires in 24 hrs

    res.status(201).json({ message: "Secret message created", id: newMessage._id });
  } catch (error) {
    console.error("❌ Error creating message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ GET: Retrieve & Delete a Secret Message
export const getSecretMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check Redis first
    let secretMessage = await redisClient.get(id);
    if (secretMessage) {
      secretMessage = JSON.parse(secretMessage);
    } else {
      secretMessage = await SecretMessage.findById(id);
    }

    if (!secretMessage) return res.status(404).json({ error: "Message not found or already deleted" });

    if (secretMessage.password) {
      if (!password) return res.status(401).json({ error: "Password required" });
      const isMatch = await bcrypt.compare(password, secretMessage.password);
      if (!isMatch) return res.status(403).json({ error: "Incorrect password" });
    }

    // Store message content before deleting
    const messageContent = secretMessage.message;

    // Delete from DB & Redis
    await SecretMessage.findByIdAndDelete(id);
    await redisClient.del(id);

    res.status(200).json({ message: messageContent });
  } catch (error) {
    console.error("❌ Error retrieving message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
