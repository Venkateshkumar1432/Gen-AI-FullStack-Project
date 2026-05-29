import { useState } from "react"
import { uploadPdf, askPdfChat, getPdfChatHistory } from "../services/pdf.api"

export const usePdfChat = () => {
    const [loading, setLoading] = useState(false)
    const [documentInfo, setDocumentInfo] = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [error, setError] = useState("")

    const uploadDocument = async (file) => {
        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("pdf", file)

            const response = await uploadPdf(formData)
            setDocumentInfo(response.document)
            return response
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to upload PDF. Please try again.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const askQuestion = async ({ documentId, question }) => {
        setLoading(true)
        setError("")

        try {
            const response = await askPdfChat({ documentId, question })
            return response
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to ask question. Please try again.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const loadHistory = async (documentId = "") => {
        setLoading(true)
        setError("")

        try {
            const response = await getPdfChatHistory(documentId)
            setChatHistory(response.history || [])
            return response.history
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Unable to load chat history.")
            return []
        } finally {
            setLoading(false)
        }
    }

    return {
        documentInfo,
        chatHistory,
        loading,
        error,
        uploadDocument,
        askQuestion,
        loadHistory,
        setError,
    }
}
