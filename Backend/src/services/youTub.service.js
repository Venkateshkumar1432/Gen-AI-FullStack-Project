const { GoogleGenAI } = require("@google/genai")
const mongoose = require("mongoose")
const youTubeModel = require("../models/VideoDocument.model")
const VideoChunk = require("../models/VideoChunk.model")
const VideoChat = require("../models/VideoChat.model")
const { URL } = require("url")
const { createEmbedding } = require("./embedding.service")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const VIDEO_VECTOR_INDEX_NAME = process.env.VIDEO_VECTOR_INDEX_NAME || "video_chunks_vector_idx"
const TOP_K = parseInt(process.env.RAG_TOP_K || "5", 10)
const SCORE_THRESHOLD = parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD || "0.1")

function extractVideoIdFromUrl(youtubeUrl) {
    try {
        const parsed = new URL(youtubeUrl)
        if (parsed.searchParams && parsed.searchParams.get('v')) return parsed.searchParams.get('v')
        if (parsed.hostname === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0]
        const parts = parsed.pathname.split('/').filter(Boolean)
        return parts.length ? parts[parts.length - 1] : null
    } catch (err) {
        return null
    }
}

async function processYouTubeUpload({ userId, youtubeUrl }) {
    if (!youtubeUrl || !userId) throw new Error('youtubeUrl and userId are required')

    const videoId = extractVideoIdFromUrl(youtubeUrl) || ''

    const doc = new youTubeModel({
        userId,
        youtubeUrl,
        videoId,
        status: "PROCESSING",
        totalChunks: 0,
        title: ""
    })

    const saved = await doc.save()
    return saved
}

async function getVideoDocumentByVideoId(videoId) {
    if (!videoId) throw new Error('videoId is required')
    return youTubeModel.findOne({ videoId })
}

async function getChatHistory(videoDocumentId, userId) {
    if (!videoDocumentId || !userId) throw new Error('videoDocumentId and userId are required')
    return VideoChat.find({ videoDocumentId, userId }).sort({ createdAt: -1 }).lean()
}

async function getChatHistoryByUser(userId) {
    if (!userId) throw new Error('userId is required')
    return VideoChat.find({ userId }).sort({ createdAt: -1 }).lean()
}

async function retrieveRelevantVideoChunks(question, videoDocumentId) {
    if (!question || !videoDocumentId) {
        throw new Error("Question and videoDocumentId are required for retrieval.")
    }

    let queryEmbedding
    try {
        queryEmbedding = await createEmbedding(question)
    } catch (err) {
        console.error('Video RAG: failed to create query embedding', err)
        throw err
    }

    let results = []
    try {
        results = await VideoChunk.aggregate([
            {
                $vectorSearch: {
                    index: VIDEO_VECTOR_INDEX_NAME,
                    path: "embedding",
                    queryVector: queryEmbedding,
                    similarity: "cosine",
                    numCandidates: 50,
                    limit: TOP_K,
                    filter: {
                        videoId: new mongoose.Types.ObjectId(videoDocumentId)
                    }
                }
            }
        ])
    } catch (err) {
        console.error('Video RAG: vector search failed', err)
    }

    if (!results.length) {
        const stored = await VideoChunk.find({ videoId: videoDocumentId }).lean()

        function cosine(a, b) {
            let dot = 0
            let na = 0
            let nb = 0
            for (let i = 0; i < a.length; i++) {
                const va = a[i] || 0
                const vb = b[i] || 0
                dot += va * vb
                na += va * va
                nb += vb * vb
            }
            if (na === 0 || nb === 0) return 0
            return dot / (Math.sqrt(na) * Math.sqrt(nb))
        }

        const scored = stored.map((c) => ({
            _id: c._id,
            content: c.content,
            metadata: c.metadata,
            embedding: c.embedding,
            score: Array.isArray(c.embedding) ? cosine(queryEmbedding, c.embedding) : null
        }))

        scored.sort((a, b) => (b.score || 0) - (a.score || 0))

        const topCandidates = scored.slice(0, TOP_K)
        return topCandidates.filter((item) => typeof item.score !== 'number' || item.score >= SCORE_THRESHOLD)
    }

    const filtered = results.filter((item) => {
        return typeof item.score !== "number" || item.score >= SCORE_THRESHOLD
    })

    if (!filtered.length) {
        return results.slice(0, TOP_K)
    }

    return filtered
}

async function createYouTubeChat({ videoDocumentId, userId, question, answer, sourceChunks = [] }) {
    if (!videoDocumentId || !userId || !question || !answer) throw new Error('Missing required fields for creating chat')

    const doc = new VideoChat({
        videoDocumentId,
        userId,
        question,
        answer,
        sourceChunks
    })

    return doc.save()
}

module.exports = {
    processYouTubeUpload,
    getVideoDocumentByVideoId,
    getChatHistory,
    getChatHistoryByUser,
    retrieveRelevantVideoChunks,
    createYouTubeChat,
    generateSummaryFromYouTubeVideo: async function ({ youtubeUrl, userQuestions, userId }) {
        if (!youtubeUrl) throw new Error('youtubeUrl is required')

        const videoId = extractVideoIdFromUrl(youtubeUrl) || ''

        const prompt = `You are an assistant that summarizes YouTube video Were i will provide youtube link and questions.\nURL: ${youtubeUrl}\n Questions: ${Array.isArray(userQuestions) ? userQuestions.join('\n') : userQuestions}\n Now based on that generate a summary of the video that answers the provided questions. Focus on providing clear and informative answers based on the content of the video.`

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            generation_config: {}
        })

        const aiText = response && (response.text || (response[0] && response[0].text)) ? (response.text || response[0].text) : JSON.stringify(response)

        const doc = new youTubeModel({
            youtubeUrl,
            videoId,
            aiSummary: aiText,
            userId
        })

        const saved = await doc.save()
        return saved
    }
}