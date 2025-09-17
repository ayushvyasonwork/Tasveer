import Story from "../models/Story.js";
import User from "../models/User.js";
import { YouTube } from "youtube-sr";
import { getImageUrl } from "../utils/getImageUrl.js";
const STORIES_CACHE_KEY = "stories";
export const uploadStory = async (req, res) => {
  try {
    const { userId, song } = req.body;
    console.log("uploadStory called with userId:", userId);
    const { redisClient } = req;

    const user = await User.findById(userId); // Verify user exists
    if (!user) {
      return res.status(400).json({ error: "User ID required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    // --- ✅ Upload image to Cloudinary ---
        const cloudinaryImage = req.cloudinaryImage;
    
        const pictureUrl = cloudinaryImage
          ? await getImageUrl(req, cloudinaryImage.public_id)
          : null;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    let songData = song ? JSON.parse(song) : undefined;

    // --- Keep YouTube logic same ---
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
      }
    }

    // ✅ Save Cloudinary URL instead of local /assets
    let newStory = new Story({
      userId,
      mediaUrl: pictureUrl,
      expiresAt,
      archived: false,
      song: songData,
    });

    console.log("New story data:", newStory);
    await newStory.save();

    // Populate user info for socket event
    newStory = await newStory.populate("userId", "firstName lastName picturePath");

    // Invalidate cache
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

    // 1️⃣ Try Redis cache first
    const cachedStories = await redisClient.get(STORIES_CACHE_KEY);
    if (cachedStories) {
      console.log("Cache HIT for stories.");
      return res.status(200).json(JSON.parse(cachedStories));
    }

    console.log("Cache MISS for stories. Fetching from DB.");
    const now = new Date();
    let stories = await Story.find({
      archived: false,
      expiresAt: { $gt: now },
    })
      .populate("userId", "firstName lastName picturePath")
      .sort({ createdAt: -1 }); // newest first

    // 2️⃣ Resolve mediaUrl via Redis if needed
    const resolvedStories = [];
    for (const story of stories) {
      let mediaUrl = story.mediaUrl;

      // If it's not already a full URL (http/https), check Redis
      if (mediaUrl && !mediaUrl.startsWith("http")) {
        const cachedUrl = await redisClient.get(`story_image:${mediaUrl}`);
        if (cachedUrl) {
          mediaUrl = cachedUrl;
        } else {
          // fallback: assume local path
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          mediaUrl = `${baseUrl}/assets/${mediaUrl}`;
        }
      }

      resolvedStories.push({
        ...story.toObject(),
        mediaUrl,
      });
    }

    // 3️⃣ Save to Redis (whole list cached for 60s)
    await redisClient.setEx(STORIES_CACHE_KEY, 60, JSON.stringify(resolvedStories));

    res.status(200).json(resolvedStories);
  } catch (error) {
    console.error("Error in getStories:", error);
    res.status(500).json({ error: error.message });
  }
};

