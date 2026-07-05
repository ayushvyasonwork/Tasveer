import OpenAI from "openai";
import config from "../../config/ai.config.js";

const client = new OpenAI({
    apiKey: config.openai.apiKey,
});

export async function generateImageResponse(
    prompt,
    base64Image,
    mimeType
) {
    const response = await client.responses.create({
        model: config.openai.model,

        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: prompt,
                    },
                    {
                        type: "input_image",
                        image_url: `data:${mimeType};base64,${base64Image}`,
                    },
                ],
            },
        ],

        temperature: 0,
    });

    const text = response.output_text?.trim() || "";

    return text.replace(/```json|```/g, "").trim();
}