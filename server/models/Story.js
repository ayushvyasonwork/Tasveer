import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  mediaUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // This tells MongoDB to automatically delete documents when the expiresAt date is reached.
  expiresAt: { type: Date, index: { expires: '1m' } }, 
  archived: { type: Boolean, default: false },
  song: {
    song_name: String,
    artist: String,
    similarity: Number,
    picks: Number // Added to handle community picks data
  }
});

const Story = mongoose.model("Story", StorySchema);
export default Story;
