const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const youTubeRouter = require("./routes/youTube.route")
const pdfRouter = require("./routes/pdf.routes")
const { errorHandler } = require("./middlewares/error.middleware")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/youtube", youTubeRouter)
app.use("/api/pdf", pdfRouter)
app.use("/health", (req, res) => {
    res.status(200).json({ message: "Server is running successfully" })
})
app.use(errorHandler)

module.exports = app