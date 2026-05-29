const gemini = require("../config/gemini")

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "models/gemini-embedding-001"

async function createEmbedding(text) {
    if (!text || typeof text !== "string") {
        throw new Error("Text must be a non-empty string to generate embeddings.")
    }

    try {
        const response = await gemini.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: [text]
        })

        const embedding = response.embeddings?.[0]?.values || null

        if (!Array.isArray(embedding)) {
            throw new Error("Failed to generate embeddings from Gemini API.")
        }

        return embedding
    } catch (error) {
        console.error("Embedding Error:", error)
        throw error
    }
}

module.exports = { createEmbedding }
