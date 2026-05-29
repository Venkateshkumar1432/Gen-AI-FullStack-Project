const mongoose = require("mongoose")

const pdfChatSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PdfDocument",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        sourceChunks: [
            {
                chunkId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "PdfChunk"
                },
                content: String,
                metadata: {
                    pageNumber: Number,
                    sectionTitle: String
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("PdfChat", pdfChatSchema)
