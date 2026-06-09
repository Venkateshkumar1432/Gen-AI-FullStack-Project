const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {

    const authHeader = req.headers.authorization || req.headers.Authorization
    let token = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
    } else if (req.cookies?.token) {
        token = req.cookies.token
    }

    if (!token) {
        return res.status(401).json({
            message: "Token not provided. Use cookie token or Authorization: Bearer <token>."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


module.exports = { authUser }
