import Story from "../models/Story.js";
import User from "../models/User.js";
import {YouTube} from "youtube-sr";
// POST: Add new story
const STORIES_CACHE_KEY = "stories";
export const uploadStory = async (req, res) => {
  try {
    const { userId, song } = req.body;
     const { redisClient } = req;
    const user = await User.findById(userId); // Verify user exists

    if (!user || !req.file) {
      return res.status(400).json({ error: "User ID and file are required" });
    }

    // IMPORTANT: Make sure your server is configured to serve static files from the 'public/assets' directory.
    // The URL path should be accessible to the client.
    const mediaUrl = `/assets/${req.file.filename}`; // Use full URL for client access
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
     let songData = song ? JSON.parse(song) : undefined;

    // --- NEW LOGIC: FIND YOUTUBE VIDEO ID ---
    if (songData && songData.song_name && songData.artist) {
      try {
        const searchQuery = `${songData.song_name} ${songData.artist} official audio`;
        const video = await YouTube.searchOne(searchQuery);
        if (video) {
          songData.youtubeVideoId = video.id;
          console.log("YouTube video found:", video.id);
        }
      } catch (ytError) {
        console.error("YouTube search failed:", ytError.message);
        // Don't block the upload, just proceed without a video ID
      }
    }
    let newStory = new Story({
      userId,
      mediaUrl,
      expiresAt,
      archived: false,
      song: songData
    });
    console.log("New story data:", newStory);
    await newStory.save();

    // Populate user info for the socket event so the frontend can display it immediately
    newStory = await newStory.populate("userId", "firstName lastName picturePath");
    await redisClient.del(STORIES_CACHE_KEY);
    console.log("Cache invalidated for stories.");
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
    const { redisClient } = req;
    const cachedStories = await redisClient.get(STORIES_CACHE_KEY);
    if (cachedStories) {
      console.log("Cache HIT for stories.");
      return res.status(200).json(JSON.parse(cachedStories));
    }
    console.log("Cache MISS for stories. Fetching from DB.");
    const now = new Date();
    const stories = await Story.find({
      archived: false,
      expiresAt: { $gt: now },
    }).populate("userId", "firstName lastName picturePath").sort({ createdAt: -1 }); // Sort by newest first
    await redisClient.setEx(STORIES_CACHE_KEY, 60, JSON.stringify(stories));
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getStories:", error);
    res.status(500).json({ error: error.message });
  }
};
