import express from "express";
import { login, register, logout } from "../controllers/auth.js";
import { uploadWithCheck } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", uploadWithCheck, register);
router.post("/logout", logout);

export default router;
