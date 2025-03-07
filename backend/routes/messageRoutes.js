import express from "express";
import { createSecretMessage, getSecretMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createSecretMessage);
router.get("/:id", getSecretMessage);

export default router;