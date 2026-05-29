const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const { validateRequest } = require("../middlewares/validation.middleware")
const upload = require("../middlewares/file.middleware")
const pdfController = require("../controllers/pdf.controller")
const { pdfChatSchema } = require("../validations/pdf.validation")

const pdfRouter = express.Router()

pdfRouter.post(
    "/upload",
    authUser,
    upload.single("pdf"),
    pdfController.uploadPdfDocument
)

pdfRouter.post(
    "/chat",
    authUser,
    validateRequest(pdfChatSchema),
    pdfController.askPdfQuestion
)

pdfRouter.get(
    "/document/:documentId",
    authUser,
    pdfController.getPdfDocumentById
)

pdfRouter.get(
    "/document/:documentId/history",
    authUser,
    pdfController.getPdfChatHistoryController
)

pdfRouter.get(
    "/history",
    authUser,
    pdfController.getPdfChatHistoryByUserController
)

module.exports = pdfRouter
