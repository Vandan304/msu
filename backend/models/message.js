import mongoose from "mongoose";

const SecretMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  password: { type: String, required: false }, // Optional password protection
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), index: { expires: '24h' } } // Auto-delete after 24 hours
});

export const SecretMessage = mongoose.model("SecretMessage", SecretMessageSchema);
