const mongoose = require("mongoose")

const VideoDocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        youtubeUrl: {
            type: String,
            required: true
        },
        videoId: {
            type: String,
            required: true,
            index: true
        },
        title: {
            type: String,
            default: ""
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

const youTubeModel = mongoose.model("VideoDocument", VideoDocumentSchema)

module.exports = youTubeModel