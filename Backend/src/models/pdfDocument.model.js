const mongoose = require("mongoose")

const pdfDocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        fileName: {
            type: String,
            required: true
        },
        originalName: {
            type: String
        },
        fileUrl: {
            type: String
        },
        totalPages: {
            type: Number,
            default: 0
        },
        totalChunks: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["PROCESSING", "COMPLETED", "FAILED"],
            default: "PROCESSING"
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("PdfDocument", pdfDocumentSchema)
