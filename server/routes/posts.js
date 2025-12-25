import express from "express";
import {
  createPost,       // already handled in server.js
  deletePost,
  getFeedPosts,
  getUserPosts,
  likePost,
  addComment,
  getComments,
} from "../controllers/posts.js";

import { verifyToken } from "../middleware/auth.js";
import { uploadWithCheck } from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, uploadWithCheck, createPost);
/* READ */
router.get("/", verifyToken, getFeedPosts);                  
router.get("/:userId/posts", verifyToken, getUserPosts);     
router.get("/:id/comments", verifyToken, getComments);       
router.post("/:id/comment", verifyToken, addComment);       
/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);            
/* DELETE */
router.delete("/:id", verifyToken, deletePost);             

export default router;
