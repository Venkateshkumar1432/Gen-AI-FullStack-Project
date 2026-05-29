const mongoose = require("mongoose")

const pdfChunkSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PdfDocument",
            required: true,
            index: true
        },
        chunkIndex: {
            type: Number,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        embedding: {
            type: [Number],
            required: true
        },
        metadata: {
            pageNumber: Number,
            sectionTitle: String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("PdfChunk", pdfChunkSchema)
