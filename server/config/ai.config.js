export default {
    provider: process.env.AI_PROVIDER || "groq",

    gemini: {
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
    },

    openai: {
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        apiKey: process.env.OPENAI_API_KEY,
    },

    groq: {
        model: process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
        apiKey: process.env.GROQ_API_KEY,
    },
};