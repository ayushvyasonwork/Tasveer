import OpenAI from "openai";
import config from "../../config/ai.config.js";

const client = new OpenAI({
    apiKey: config.groq.apiKey,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function generateImageResponse(
    prompt,
    base64Image,
    mimeType
) {
    const response = await client.chat.completions.create({
        model: config.groq.model,

        temperature: 0,

        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`,
                        },
                    },
                ],
            },
        ],
    });

    const text = response.choices?.[0]?.message?.content?.trim() || "";

    return text.replace(/```json|```/g, "").trim();
}