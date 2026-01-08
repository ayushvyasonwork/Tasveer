import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getMessages,
  getConversations,
  sendMessage,
} from "../controllers/chat.js";

const router = express.Router();

/* ROUTES */
router.get("/conversations", verifyToken, getConversations);
router.get("/:otherUserId", verifyToken, getMessages);
router.post("/", verifyToken, sendMessage);

export default router;