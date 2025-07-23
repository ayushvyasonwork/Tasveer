import express from 'express';
import { uploadStory, getStories } from '../controllers/storyController.js';
import { verifyToken } from '../middleware/auth.js';

// The function now accepts the 'upload' middleware as an argument
const storyRoutes = (upload) => {
    const router = express.Router();

    /* READ */
    router.get("/", verifyToken, getStories);

    /* POST */
    // Apply the upload middleware here. The field name 'media' must match the frontend.
    router.post("/", verifyToken, upload.single("media"), uploadStory);

    return router;
};

export default storyRoutes;
