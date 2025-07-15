import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto delete after 1 hour
  },
});

const Story = mongoose.model("Story", StorySchema);
export default Story;
