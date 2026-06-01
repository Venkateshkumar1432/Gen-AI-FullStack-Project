import { useState } from "react"
import { uploadYouTubeVideo, askYouTubeChat, getYouTubeChatHistory } from "../services/youTube.api"

export const useYouTubeChat = () => {
    const [loading, setLoading] = useState(false)
    const [videoInfo, setVideoInfo] = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [error, setError] = useState("")

    const uploadVideo = async ({ youtubeUrl }) => {
        setLoading(true)
        setError("")

        try {
            const response = await uploadYouTubeVideo({ youtubeUrl })
            setVideoInfo(response.document)
            return response
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to process YouTube video. Please try again.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const askQuestion = async ({ videoId, question }) => {
        setLoading(true)
        setError("")

        try {
            const response = await askYouTubeChat({ videoId, question })
            return response
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to ask the YouTube video. Please try again.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const loadHistory = async (videoId = "") => {
        if (!videoId) {
            setChatHistory([])
            return []
        }

        setLoading(true)
        setError("")

        try {
            const response = await getYouTubeChatHistory(videoId)
            setChatHistory(response.history || [])
            return response.history
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to load YouTube chat history.")
            setChatHistory([])
            return []
        } finally {
            setLoading(false)
        }
    }

    return {
        videoInfo,
        chatHistory,
        loading,
        error,
        uploadVideo,
        askQuestion,
        loadHistory,
        setError,
    }
}
