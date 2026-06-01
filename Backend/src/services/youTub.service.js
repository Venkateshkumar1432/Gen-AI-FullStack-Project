// const { GoogleGenAI } = require("@google/genai")
const mongoose = require("mongoose")
const youTubeModel = require("../models/VideoDocument.model")
const VideoChunk = require("../models/VideoChunk.model")
const VideoChat = require("../models/VideoChat.model")
const { URL } = require("url")
const { createEmbedding } = require("./embedding.service")
const { chunkText } = require("../utils/chunkText")
const { Innertube } = require("youtubei.js");
const { YoutubeTranscript } = require("youtube-transcript");


const VIDEO_VECTOR_INDEX_NAME = process.env.VIDEO_VECTOR_INDEX_NAME || "video_chunks_vector_idx"
const TOP_K = parseInt(process.env.RAG_TOP_K || "5", 10)
const SCORE_THRESHOLD = parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD || "0.1")
const CHUNK_SIZE = parseInt(process.env.PDF_CHUNK_SIZE || "900", 10)
const CHUNK_OVERLAP = parseInt(process.env.PDF_CHUNK_OVERLAP || "180", 10)

const extractVideoId = (url) => {
    const regex =
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^&\n?#]+)/;

    const match = url.match(regex);

    return match ? match[1] : null;
};

async function createVideoDocument({ userId, youtubeUrl, videoId, title, status }) {
    return youTubeModel.create({
        userId,
        youtubeUrl,
        videoId,
        title,
        status
    })
}  

async function savePdfChunks(documentId, chunks) {
    const chunkDocuments = []

    for (let index = 0; index < chunks.length; index += 1) {
        const content = chunks[index]
        const embedding = await createEmbedding(content)

        chunkDocuments.push({
            videoId: documentId,
            chunkIndex: index,
            content,
            embedding,
        })
    }

    return VideoChunk.insertMany(chunkDocuments)
}

async function processYouTubeUpload({ userId, youtubeUrl }) {
    if (!youtubeUrl || !userId) throw new Error('youtubeUrl and userId are required')

    const videoId = extractVideoId(youtubeUrl)

    if (!videoId) {
        throw new Error("Invalid YouTube URL")
    }

    /**
    * Fetch Video Metadata
    */
    const youtube = await Innertube.create();

    const info = await youtube.getInfo(videoId);

    const basicInfo = info.basic_info;
    /**
        * Fetch Transcript
    */
    let transcriptText = "";

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        transcriptText = transcript
            .map((item) => item.text)
            .join(" ");
    } catch (transcriptError) {
            console.log("Transcript not available");
        }
    // const doc = new youTubeModel({
    //     userId,
    //     youtubeUrl,
    //     videoId,
    //     status: "PROCESSING",
    //     title: basicInfo.title,
    // })
    const Videodocument = await createVideoDocument({
        userId,
        youtubeUrl,
        videoId,
        title: basicInfo.title,
        status: "PROCESSING"
    })
    console.log("Created YouTube document, now saving...", Videodocument)
    try{    
            const chunks = chunkText(transcriptText, CHUNK_SIZE, CHUNK_OVERLAP)
            console.log('The chunks are:-', chunks)
            const insertedChunks = await savePdfChunks(Videodocument._id, chunks)
            Videodocument.totalChunks = insertedChunks.length
            Videodocument.status = "COMPLETED"
            await Videodocument.save()
            return Videodocument
    }catch(err){
        Videodocument.status = "FAILED"
        await Videodocument.save()
        throw error
    }
}

async function getVideoDocumentByVideoId(videoId) {
    if (!videoId) throw new Error('videoId is required')

    if (mongoose.isValidObjectId(videoId)) {
        const documentById = await youTubeModel.findById(videoId)
        if (documentById) return documentById
    }

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
    createYouTubeChat
}