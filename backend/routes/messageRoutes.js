import express from "express";
import { createSecretMessage, getSecretMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createSecretMessage); // ✅ Create message and return shareable link
router.post("/:id", getSecretMessage); // ✅ Use POST to retrieve & delete message (one-time use)

export default router;
