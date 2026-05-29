const { z } = require("zod")

const pdfChatSchema = z.object({
    documentId: z.string().min(1, "documentId is required"),
    question: z.string().min(3, "question must be at least 3 characters")
})

module.exports = { pdfChatSchema }
