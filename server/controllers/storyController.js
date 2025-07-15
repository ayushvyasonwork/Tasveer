import Story from "../models/Story.js";
import User from "../models/User.js";

// POST: Add new story
export const uploadStory = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !req.file) {
      return res.status(400).json({ error: "User ID and file are required"  
      });
    }
    const mediaUrl = `/assets/${req.file.filename}`;
    const newStory = new Story({ userId, mediaUrl });
    await newStory.save();
    req.io.emit("newStory", newStory); // Broadcast to all users
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET: Get all current stories
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find().populate("userId", "firstName lastName picturePath");
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
