import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_BACKEND_API

function getStoredToken() {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem("authToken")
}

export function storeAuthToken(token) {
    if (typeof window !== "undefined") {
        window.localStorage.setItem("authToken", token)
    }
}

export function clearAuthToken() {
    if (typeof window !== "undefined") {
        window.localStorage.removeItem("authToken")
    }
}

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = getStoredToken()

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        }
    }

    return config
})

export default api
