const { PDFParse } = require("pdf-parse")
const PdfDocument = require("../models/pdfDocument.model")
const PdfChunk = require("../models/pdfChunk.model")
const { chunkText } = require("../utils/chunkText")
const { createEmbedding } = require("./embedding.service")

const CHUNK_SIZE = parseInt(process.env.PDF_CHUNK_SIZE || "900", 10)
const CHUNK_OVERLAP = parseInt(process.env.PDF_CHUNK_OVERLAP || "180", 10)

async function extractPdfText(buffer) {
    const pdf = new PDFParse({ data: buffer })
    const data = await pdf.getText()

    return {
        text: data.text?.trim() || "",
        totalPages: data.total || 0
    }
}

async function createPdfDocument({ userId, fileName, originalName, totalPages }) {
    return PdfDocument.create({
        userId,
        fileName,
        originalName,
        totalPages,
        status: "PROCESSING"
    })
}

async function savePdfChunks(documentId, chunks) {
    const chunkDocuments = []

    for (let index = 0; index < chunks.length; index += 1) {
        const content = chunks[index]
        const embedding = await createEmbedding(content)

        chunkDocuments.push({
            documentId,
            chunkIndex: index,
            content,
            embedding,
            metadata: {
                pageNumber: null
            }
        })
    }

    return PdfChunk.insertMany(chunkDocuments)
}

async function processPdfUpload({ userId, fileName, originalName, buffer }) {

    console.log("Processing PDF buffer for file:", buffer)

    const extracted = await extractPdfText(buffer)

    console.log("Extracted content from pdf is", extracted)
    // console.log(process.env.GOOGLE_GENAI_API_KEY)

    const document = await createPdfDocument({
        userId,
        fileName,
        originalName,
        totalPages: extracted.totalPages
    })

    console.log(document)
    try {
        const chunks = chunkText(extracted.text, CHUNK_SIZE, CHUNK_OVERLAP)
        console.log('The chunks are:-', chunks)
        const insertedChunks = await savePdfChunks(document._id, chunks)

        document.totalChunks = insertedChunks.length
        document.status = "COMPLETED"
        await document.save()

        return document
    } catch (error) {
        document.status = "FAILED"
        await document.save()
        throw error
    }
}

async function getPdfDocument(documentId) {
    return PdfDocument.findById(documentId)
}

async function getChatHistory(documentId, userId) {
    const PdfChat = require("../models/pdfChat.model")
    return PdfChat.find({ documentId, userId }).sort({ createdAt: -1 })
}

async function getChatHistoryByUser(userId) {
    const PdfChat = require("../models/pdfChat.model")
    return PdfChat.find({ userId }).sort({ createdAt: -1 })
}

module.exports = {
    extractPdfText,
    createPdfDocument,
    savePdfChunks,
    processPdfUpload,
    getPdfDocument,
    getChatHistory,
    getChatHistoryByUser
}
