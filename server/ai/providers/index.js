import config from "../../config/ai.config.js";

import * as gemini from "./gemini.provider.js";
import * as openai from "./openai.provider.js";
import * as groq from "./groq.provider.js";

const providers = {
    gemini,
    openai,
    groq,
};

export default providers[config.provider];