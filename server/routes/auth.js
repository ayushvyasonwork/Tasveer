import express from "express";
import { login,register } from "../controllers/auth.js";
import { uploadWithCheck } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", login);
router.post("/register",uploadWithCheck, register);

export default router;
