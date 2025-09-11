import Post from "../models/Post.js";
import User from "../models/User.js";
import { getImageUrl } from "../utils/getImageUrl.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

/* -------------------- CREATE POST -------------------- */
export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pictureFilename = req.file?.filename; // saved by multer
    const pictureUrl = await getImageUrl(req, pictureFilename);

    // ✅ Save post immediately (local URL / fallback until Cloudinary is ready)
    let newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: await getImageUrl(req, user.picturePath),
      picturePath: pictureUrl, // local or cached Cloudinary
      likes: {},
      comments: [],
    });

    await newPost.save();

    // ✅ Trigger async Cloudinary upload (non-blocking)
    if (pictureFilename) {
      const localPath = path.join("public/assets", pictureFilename);

      (async () => {
        try {
          const uploadResult = await cloudinary.uploader.upload(localPath, {
            folder: "social_app/posts",
            resource_type: "image",
          });

          // ✅ Update Redis cache
          await req.redisClient.setEx(
            `image:${pictureFilename}`,
            24 * 60 * 60,
            JSON.stringify(uploadResult.secure_url)
          );

          // ✅ Update DB with Cloudinary URL
          await Post.findByIdAndUpdate(newPost._id, {
            picturePath: uploadResult.secure_url,
            picturePublicId: uploadResult.public_id,
          });

          // ✅ Notify frontend via socket (optional)
          req.io.emit("postImageUpdated", {
            postId: newPost._id,
            cloudUrl: uploadResult.secure_url,
          });

          console.log(
            "✅ Cloudinary upload successful:",
            uploadResult.secure_url
          );
        } catch (cloudErr) {
          console.error("❌ Cloudinary upload failed:", cloudErr.message);
        }
      })();
    }

    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* -------------------- DELETE POST -------------------- */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // 1️⃣ Delete from MongoDB
    await Post.findByIdAndDelete(id);

    // 2️⃣ Delete from Cloudinary if exists
    if (post.picturePublicId) {
      try {
        await cloudinary.uploader.destroy(post.picturePublicId);
        console.log("✅ Cloudinary image deleted:", post.picturePublicId);
      } catch (err) {
        console.error("❌ Cloudinary delete failed:", err.message);
      }
    }

    // 3️⃣ Delete from local multer storage
    if (post.picturePath && post.picturePath.includes("/assets/")) {
      const localFilename = post.picturePath.split("/assets/")[1];
      const localPath = path.join("public/assets", localFilename);
      fs.unlink(localPath, (err) => {
        if (err) console.error("⚠️ Local file delete failed:", err.message);
        else console.log("✅ Local file deleted:", localPath);
      });
    }

    // 4️⃣ Invalidate Redis cache
    try {
      await req.redisClient.del("posts");
      await req.redisClient.del("stories");
      if (post.picturePath) {
        await req.redisClient.del(`image:${post.picturePath}`);
      }
      console.log("✅ Redis cache invalidated for deleted post:", id);
    } catch (redisErr) {
      console.error("Redis cache clear failed:", redisErr.message);
    }

    res.send({
      success: true,
      message: "Post deleted everywhere (DB, Redis, Cloudinary, Local)",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* -------------------- GET FEED POSTS -------------------- */
export const getFeedPosts = async (req, res) => {
  try {
    // 1️⃣ Check Redis cache
    const cached = await req.redisClient.get("posts");
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 2️⃣ Fallback: DB query
    const posts = await Post.find().sort({ createdAt: -1 });

    // 3️⃣ Save to Redis (cache for 1 min or so)
    await req.redisClient.setEx("posts", 60, JSON.stringify(posts));

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* -------------------- GET USER POSTS -------------------- */
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* -------------------- LIKE / UNLIKE POST -------------------- */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);

    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* -------------------- ADD COMMENT -------------------- */
export const addComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { userId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.comments.push({ userId, text });
    await post.save();

    const updatedPost = await Post.findById(postId).populate({
      path: "comments.userId",
      select: "firstName lastName picturePath",
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment." });
  }
};

/* -------------------- GET COMMENTS -------------------- */
export const getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const post = await Post.findById(postId).populate({
      path: "comments.userId",
      select: "firstName lastName picturePath",
    });

    if (!post) return res.status(404).json({ message: "Post not found." });

    res.status(200).json(post.comments);
  } catch (err) {
    console.error("Error getting comments:", err);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
};
