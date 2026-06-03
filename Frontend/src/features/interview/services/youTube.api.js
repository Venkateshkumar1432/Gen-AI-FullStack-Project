import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_BACKEND_API
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

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