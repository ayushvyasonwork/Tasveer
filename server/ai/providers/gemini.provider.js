import config from "../../config/ai.config.js";

export async function generateImageResponse(prompt, base64Image, mimeType) {
    const apiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0,
        },
    };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const json = await response.json();

    return (
        json.candidates?.[0]?.content?.parts
            ?.map((x) => x.text || "")
            .join("")
            .replace(/```json|```/g, "")
            .trim() || ""
    );
}