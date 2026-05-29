const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const { validateRequest } = require("../middlewares/validation.middleware")
const youTubeController = require("../controllers/youTube.controller")
const { youtubeUploadSchema, youtubeChatSchema } = require("../validations/youTube.validation")

const youTubeRoute = express.Router()

youTubeRoute.post(
    "/upload",
    authUser,
    validateRequest(youtubeUploadSchema),
    youTubeController.uploadYouTubeVideo
)

youTubeRoute.post(
    "/chat",
    authUser,
    validateRequest(youtubeChatSchema),
    youTubeController.chatYouTubeVideo
)

youTubeRoute.get(
    "/document/:videoId",
    authUser,
    youTubeController.getVideoDocumentByVideoId
)

youTubeRoute.get(
    "/document/:videoId/history",
    authUser,
    youTubeController.getYouTubeChatHistoryController
)

youTubeRoute.get(
    "/history",
    authUser,
    youTubeController.getYouTubeChatHistoryByUserController
)

module.exports = youTubeRoute

