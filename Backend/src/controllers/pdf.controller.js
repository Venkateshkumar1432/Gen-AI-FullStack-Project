const mongoose = require("mongoose")
const PdfDocument = require("../models/pdfDocument.model")
const PdfChat = require("../models/pdfChat.model")
const { processPdfUpload, getPdfDocument, getChatHistory, getChatHistoryByUser } = require("../services/pdf.service")
const { retrieveRelevantChunks } = require("../services/rag.service")
const { generateAnswer } = require("../services/gemini.service")

async function uploadPdfDocument(req, res, next) {
    try {
        const file = req.file

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required."
            })
        }

        if (file.mimetype !== "application/pdf") {
            return res.status(400).json({
                success: false,
                message: "Only PDF files are allowed."
            })
        }

        const pdfDocument = await processPdfUpload({
            userId: req.user.id,
            fileName: file.originalname,
            originalName: file.originalname,
            buffer: file.buffer
        })

        return res.status(201).json({
            success: true,
            message: "PDF uploaded successfully.",
            document: {
                id: pdfDocument._id,
                status: pdfDocument.status,
                totalPages: pdfDocument.totalPages,
                totalChunks: pdfDocument.totalChunks
            }
        })
    } catch (error) {
        next(error)
    }
}

async function askPdfQuestion(req, res, next) {
    try {
        const { documentId, question } = req.body

        if (!mongoose.isValidObjectId(documentId)) {
            return res.status(400).json({
                success: false,
                message: "documentId is invalid."
            })
        }

        const pdfDocument = await getPdfDocument(documentId)

        if (!pdfDocument) {
            return res.status(404).json({
                success: false,
                message: "PDF document not found."
            })
        }

        if (pdfDocument.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this document."
            })
        }

        if (pdfDocument.status !== "COMPLETED") {
            return res.status(422).json({
                success: false,
                message: "PDF processing is not completed yet. Please wait and try again."
            })
        }

        const relevantChunks = await retrieveRelevantChunks(question, documentId)

        if (!relevantChunks.length) {
            return res.status(200).json({
                success: true,
                answer: "I could not find this information in the uploaded PDF.",
                source: []
            })
        }

        const context = relevantChunks
            .map((chunk, index) => `Source ${index + 1} (score: ${chunk.score?.toFixed(3) || "N/A"}):\n${chunk.content}`)
            .join("\n\n")

        const answer = await generateAnswer(context, question)

        const chat = await PdfChat.create({
            documentId,
            userId: req.user.id,
            question,
            answer,
            sourceChunks: relevantChunks.map((chunk) => ({
                chunkId: chunk._id,
                content: chunk.content,
                metadata: chunk.metadata
            }))
        })

        return res.status(200).json({
            success: true,
            answer,
            source: relevantChunks.map((chunk) => ({
                chunkId: chunk._id,
                score: chunk.score,
                metadata: chunk.metadata
            }))
        })
    } catch (error) {
        next(error)
    }
}

async function getPdfDocumentById(req, res, next) {
    try {
        const { documentId } = req.params

        if (!mongoose.isValidObjectId(documentId)) {
            return res.status(400).json({
                success: false,
                message: "documentId is invalid."
            })
        }

        const pdfDocument = await getPdfDocument(documentId)

        if (!pdfDocument) {
            return res.status(404).json({
                success: false,
                message: "PDF document not found."
            })
        }

        if (pdfDocument.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this document."
            })
        }

        return res.status(200).json({
            success: true,
            document: pdfDocument
        })
    } catch (error) {
        next(error)
    }
}

async function getPdfChatHistoryController(req, res, next) {
    try {
        const { documentId } = req.params

        if (!mongoose.isValidObjectId(documentId)) {
            return res.status(400).json({
                success: false,
                message: "documentId is invalid."
            })
        }

        const pdfDocument = await getPdfDocument(documentId)

        if (!pdfDocument) {
            return res.status(404).json({
                success: false,
                message: "PDF document not found."
            })
        }

        if (pdfDocument.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this document."
            })
        }

        const history = await getChatHistory(documentId, req.user.id)

        return res.status(200).json({
            success: true,
            history
        })
    } catch (error) {
        next(error)
    }
}

async function getPdfChatHistoryByUserController(req, res, next) {
    try {
        const history = await getChatHistoryByUser(req.user.id)

        return res.status(200).json({
            success: true,
            history
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    uploadPdfDocument,
    askPdfQuestion,
    getPdfDocumentById,
    getPdfChatHistoryController,
    getPdfChatHistoryByUserController
}
