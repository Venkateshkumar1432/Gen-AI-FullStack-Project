import api from "../../../services/apiClient"

export const uploadYouTubeVideo = async ({ youtubeUrl }) => {
    const response = await api.post("/api/youtube/upload", { youtubeUrl })
    return response.data
}

export const askYouTubeChat = async ({ videoId, question }) => {
    const response = await api.post("/api/youtube/chat", { videoId, question })
    return response.data
}

export const getYouTubeChatHistory = async (videoId = "") => {
    const url = videoId ? `/api/youtube/document/${videoId}/history` : "/api/youtube/history"
    const response = await api.get(url)
    return response.data
}