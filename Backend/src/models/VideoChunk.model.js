const mongoose = require("mongoose")

const VideoChunkSchema = new mongoose.Schema(
    {
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VideoDocument",
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
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("VideoChunk", VideoChunkSchema)
