const mongoose = require("mongoose")
const {
    processYouTubeUpload,
    getVideoDocumentByVideoId: fetchVideoDocumentByVideoId,
    getChatHistory,
    getChatHistoryByUser,
    retrieveRelevantVideoChunks,
    createYouTubeChat
} = require("../services/youTub.service")
const { generateAnswer } = require("../services/gemini.service")

async function uploadYouTubeVideo(req, res, next) {
    try {
        const { youtubeUrl } = req.body
        const userId = req.user.id

        if (!youtubeUrl) {
            return res.status(400).json({
                success: false,
                message: "YouTube URL is required."
            })
        }

        const videoDocument = await processYouTubeUpload({ userId, youtubeUrl })

        return res.status(201).json({
            success: true,
            message: "YouTube video processed successfully.",
            document: {
                id: videoDocument._id,
                videoId: videoDocument.videoId,
                title: videoDocument.title,
                status: videoDocument.status,
                totalChunks: videoDocument.totalChunks
            }
        })
    } catch (error) {
        next(error)
    }
}

async function chatYouTubeVideo(req, res, next) {
    try {
        const { videoId, question } = req.body
        const userId = req.user.id

        if (!videoId || !question) {
            return res.status(400).json({
                success: false,
                message: "videoId and question are required."
            })
        }

        const videoDocument = await fetchVideoDocumentByVideoId(videoId)

        if (!videoDocument) {
            return res.status(404).json({
                success: false,
                message: "YouTube document not found."
            })
        }

        if (videoDocument.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this video." 
            })
        }

        if (videoDocument.status !== "COMPLETED") {
            return res.status(422).json({
                success: false,
                message: "Video processing is not completed yet. Please wait and try again."
            })
        }

        const relevantChunks = await retrieveRelevantVideoChunks(question, videoDocument._id)

        if (!relevantChunks.length) {
            return res.status(200).json({
                success: true,
                answer: "I could not find this information in the uploaded video transcript.",
                source: []
            })
        }

        const context = relevantChunks
            .map((chunk, index) => `Source ${index + 1} (score: ${chunk.score?.toFixed(3) || "N/A"}):\n${chunk.content}`)
            .join("\n\n")

        const answer = await generateAnswer(context, question, "YouTube video transcript")

        await createYouTubeChat({
            videoDocumentId: videoDocument._id,
            userId,
            question,
            answer,
            sourceChunks: relevantChunks.map((chunk) => ({
                chunkId: chunk._id,
                content: chunk.content,
                metadata: chunk.metadata || {}
            }))
        })

        return res.status(200).json({
            success: true,
            answer,
            source: relevantChunks.map((chunk) => ({
                chunkId: chunk._id,
                score: chunk.score,
                metadata: chunk.metadata || {}
            }))
        })
    } catch (error) {
        next(error)
    }
}

async function getVideoDocumentByVideoId(req, res, next) {
    try {
        const { videoId } = req.params
        const userId = req.user.id

        const videoDocument = await fetchVideoDocumentByVideoId(videoId)

        if (!videoDocument) {
            return res.status(404).json({
                success: false,
                message: "YouTube document not found."
            })
        }

        if (videoDocument.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this video." 
            })
        }

        return res.status(200).json({
            success: true,
            document: videoDocument
        })
    } catch (error) {
        next(error)
    }
}

async function getYouTubeChatHistoryController(req, res, next) {
    try {
        const { videoId } = req.params
        const userId = req.user.id

        const videoDocument = await fetchVideoDocumentByVideoId(videoId)

        if (!videoDocument) {
            return res.status(404).json({
                success: false,
                message: "YouTube document not found."
            })
        }

        if (videoDocument.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this video." 
            })
        }

        const history = await getChatHistory(videoDocument._id, userId)

        return res.status(200).json({
            success: true,
            history
        })
    } catch (error) {
        next(error)
    }
}

async function getYouTubeChatHistoryByUserController(req, res, next) {
    try {
        const userId = req.user.id
        const history = await getChatHistoryByUser(userId)

        return res.status(200).json({
            success: true,
            history
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    uploadYouTubeVideo,
    chatYouTubeVideo,
    getVideoDocumentByVideoId,
    getYouTubeChatHistoryController,
    getYouTubeChatHistoryByUserController
}

