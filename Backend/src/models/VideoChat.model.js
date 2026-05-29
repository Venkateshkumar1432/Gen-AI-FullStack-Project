const mongoose = require("mongoose")

const videoChatSchema = new mongoose.Schema(
    {
        videoDocumentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VideoDocument",
            required: true,
            index: true
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
                    ref: "VideoChunk"
                },
                content: String,
                metadata: {
                    type: Object,
                    default: {}
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("VideoChat", videoChatSchema)
