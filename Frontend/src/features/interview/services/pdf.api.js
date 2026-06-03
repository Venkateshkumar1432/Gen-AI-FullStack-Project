import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_BACKEND_API

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

export const uploadPdf = async (formData) => {
    const response = await api.post("/api/pdf/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return response.data
}

export const askPdfChat = async ({ documentId, question }) => {
    const response = await api.post("/api/pdf/chat", {
        documentId,
        question
    })
    return response.data
}

export const getPdfChatHistory = async (documentId = "") => {
    const url = documentId ? `/api/pdf/document/${documentId}/history` : "/api/pdf/history"
    const response = await api.get(url)
    return response.data
}
