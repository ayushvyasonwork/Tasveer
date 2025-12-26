import express from "express";
import { uploadStory, getStories } from "../controllers/storyController.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadWithCheck } from "../middleware/upload.js";

const router = express.Router();

/* READ STORIES */
router.get("/", verifyToken, getStories);

/* UPLOAD STORY */
router.post("/", verifyToken, uploadWithCheck, uploadStory);

export default router;
