import express from "express";
import { login, register, logout } from "../controllers/auth.js";
import { uploadWithCheck } from "../middleware/upload.js";
import { issueWsToken } from "../controllers/ws-token.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", uploadWithCheck, register);
router.post("/logout", logout);
router.get("/ws-token",issueWsToken)
export default router;