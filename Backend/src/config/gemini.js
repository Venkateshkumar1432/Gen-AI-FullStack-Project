// const { GoogleGenAI } = require("@google/genai")
// const { GoogleGenerativeAI } = require("@google/generative-ai")
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
const apiVersion = process.env.GEMINI_API_VERSION || "v1"

if (!apiKey) {
    throw new Error(
        "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENAI_API_KEY in environment variables."
    )
}

const gemini = new GoogleGenAI({ apiKey, apiVersion })

module.exports = gemini
