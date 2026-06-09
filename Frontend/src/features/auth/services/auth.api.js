import api, { storeAuthToken, clearAuthToken } from "../../../services/apiClient"

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        const token = response.data?.user?.token || response.data?.token
        if (token) storeAuthToken(token)

        return response.data

    } catch (err) {

        console.log(err)

    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        const token = response.data?.user?.token || response.data?.token
        if (token) storeAuthToken(token)

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")
        clearAuthToken()

        return response.data

    } catch (err) {

    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}