import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import User from "../models/User.js";
import { getImageUrl } from "../utils/getImageUrl.js";

const router = express.Router();

/**
 * Verify token endpoint
 * If token is valid, returns user data
 * If token is invalid/expired, returns 401
 */
router.get("/verify-token", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({ user: userObject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
