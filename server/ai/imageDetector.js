import { generateImageResponse } from "./aiClient.js";
import { DETECT_AI_IMAGE_PROMPT } from "./prompts/detectAIGeneratedImage.prompt.js";

export async function detectAIGeneratedImage(
    base64Image,
    mimeType
) {
    try {
        const raw = await generateImageResponse(
            DETECT_AI_IMAGE_PROMPT,
            base64Image,
            mimeType
        );

        const parsed = JSON.parse(raw);

        return parsed.isAIGenerated === true;
    } catch (err) {
        console.error(err);

        // Fail safe:
        // if AI cannot decide,
        // classify as real.
        return false;
    }
}