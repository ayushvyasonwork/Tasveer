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

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);                  // /posts/
router.get("/:userId/posts", verifyToken, getUserPosts);     // /posts/:userId/posts
router.get("/:id/comments", verifyToken, getComments);       // /posts/:id/comments

/* CREATE (comment only; post is handled in server.js) */
router.post("/:id/comment", verifyToken, addComment);        // /posts/:id/comment

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);            // /posts/:id/like

/* DELETE */
router.delete("/:id", verifyToken, deletePost);              // /posts/:id

export default router;
