import express from "express";
import { uploadStory, getStories } from "../controllers/storyController.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/assets"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("media"), uploadStory);
router.get("/", verifyToken, getStories);

export default router;
