const { z } = require("zod")

const youtubeUploadSchema = z.object({
    youtubeUrl: z.string().url({ message: "Invalid YouTube URL." }).nonempty()
})

const youtubeChatSchema = z.object({
    videoId: z.string().nonempty(),
    question: z.string().min(1, "Question is required.")
})

module.exports = {
    youtubeUploadSchema,
    youtubeChatSchema
}
