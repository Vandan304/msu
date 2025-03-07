import express from "express";
import {
  postConfession,
  getAllConfessions,
  updateConfession,
  deleteConfession,
} from "../controllers/confessionController.js";

const router = express.Router();

router.post("/", postConfession);  // ✅ Create a confession
router.get("/", getAllConfessions); // ✅ Fetch all confessions
router.put("/:id", updateConfession); // ✅ Update a confession
router.delete("/:id", deleteConfession); // ✅ Delete a confession

export default router;
