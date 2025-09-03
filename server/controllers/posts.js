import Post from "../models/Post.js";
import User from "../models/User.js";
import { getImageUrl } from "../utils/getImageUrl.js";

export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: getImageUrl(req, user.picturePath),
      picturePath: getImageUrl(req, req.file?.filename),
      likes: {},
      comments: [],
    });
    
    await newPost.save();
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const deletePost=async (req,res)=>{
  // const {userId}=req.body;
  const {id}=req.params;
  const post =await Post.findByIdAndDelete(id);
  if(post){
    // await Post.delete(post);
    res.send({
      success:true,
      message:'post deleted successsfully'
    })
  }else{
    res.send({
      success:false,
      message:'error in deleting post'
    })
  }
}
/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
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

