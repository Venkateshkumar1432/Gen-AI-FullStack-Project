const gemini = require("../config/gemini")

const QA_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash"

async function generateAnswer(context, question, sourceLabel = "uploaded content") {
    if (!context || !question) {
        throw new Error("Context and question are required to generate an answer.")
    }

    const prompt = `You are an assistant that answers ONLY from the source context provided below.
If the answer is not found in the context, respond exactly with:
"I could not find this information in the uploaded source."
Do not hallucinate or use external knowledge.

SOURCE LABEL: ${sourceLabel}

SOURCE CONTEXT:
${context}

Question: ${question}`

    const response = await gemini.models.generateContent({
        model: QA_MODEL,
        contents: prompt,
        config: {
            temperature: 0,
            maxOutputTokens: 512
        }
    })

    return response.text?.trim() || "I could not find this information in the uploaded source."
}

module.exports = { generateAnswer }
