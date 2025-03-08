import express from "express";
import { createSecretMessage, getSecretMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createSecretMessage);
router.post("/:id", getSecretMessage); // ✅ Changed from GET to POST (to send key/password)

export default router;
