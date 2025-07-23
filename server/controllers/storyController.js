import Story from "../models/Story.js";
import User from "../models/User.js";

// POST: Add new story
export const uploadStory = async (req, res) => {
  try {
    const { userId, song } = req.body;
    const user = await User.findById(userId); // Verify user exists

    if (!user || !req.file) {
      return res.status(400).json({ error: "User ID and file are required" });
    }

    // IMPORTANT: Make sure your server is configured to serve static files from the 'public/assets' directory.
    // The URL path should be accessible to the client.
    const mediaUrl = `/assets/${req.file.filename}`; // Use full URL for client access
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let newStory = new Story({
      userId,
      mediaUrl,
      expiresAt,
      archived: false,
      song: song ? JSON.parse(song) : undefined,
    });

    await newStory.save();

    // Populate user info for the socket event so the frontend can display it immediately
    newStory = await newStory.populate("userId", "firstName lastName picturePath");

    req.io.emit("newStory", newStory);
    res.status(201).json(newStory);
  } catch (error) {
    console.error("Error in uploadStory:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET: Get all current stories
export const getStories = async (req, res) => {
  try {
    const now = new Date();
    const stories = await Story.find({
      archived: false,
      expiresAt: { $gt: now },
    }).populate("userId", "firstName lastName picturePath").sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getStories:", error);
    res.status(500).json({ error: error.message });
  }
};
