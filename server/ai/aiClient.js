import provider from "./providers/index.js";

export async function generateImageResponse(
    prompt,
    image,
    mimeType
) {
    return provider.generateImageResponse(
        prompt,
        image,
        mimeType
    );
}