import cron from "node-cron";
import { SecretMessage } from "../models/message.js";

// Runs every hour to delete expired messages
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    await SecretMessage.deleteMany({ expiresAt: { $lt: now } });
    console.log("🗑️ Expired messages deleted");
  } catch (error) {
    console.error("❌ Error deleting expired messages:", error.message);
  }
});
