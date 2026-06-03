import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useYouTubeChat } from "../hooks/useYouTubeChat"
import "../style/document-chat.scss"

const YouTubeChat = () => {
    const { videoInfo, chatHistory, loading, error, uploadVideo, askQuestion, loadHistory } = useYouTubeChat()
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [question, setQuestion] = useState("")
    const [status, setStatus] = useState("")
    const [lastChat, setLastChat] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (videoInfo?.videoId) {
            loadHistory(videoInfo.videoId)
        }
    }, [videoInfo])

    const handleUpload = async () => {
        if (!youtubeUrl.trim()) {
            setStatus("Enter a valid YouTube URL to continue.")
            return
        }

        setStatus("Processing video, this may take a moment...")
        const response = await uploadVideo({ youtubeUrl: youtubeUrl.trim() })

        if (response?.document?.videoId) {
            await loadHistory(response.document.videoId)
            setStatus("YouTube video processed successfully. Ask a question below.")
        } else {
            setStatus("Failed to process the video. Please try again.")
        }
    }

    const handleAsk = async () => {
        if (!videoInfo?.videoId) {
            setStatus("Upload a YouTube video before asking a question.")
            return
        }

        if (!question.trim()) {
            setStatus("Your question cannot be empty.")
            return
        }

        if (videoInfo.status !== "COMPLETED") {
            setStatus("The video is still processing. Please wait until it completes.")
            return
        }

        setStatus("Generating an answer from the video transcript...")
        const response = await askQuestion({ videoId: videoInfo.videoId, question: question.trim() })

        if (response?.answer) {
            setLastChat({
                question: question.trim(),
                answer: response.answer,
                source: response.source || [],
                timestamp: new Date()
            })
            setQuestion("")
            setStatus("Answer received. Scroll down for full chat history.")
            await loadHistory(videoInfo.videoId)
        } else {
            setStatus("Could not get an answer. Please try rephrasing your question.")
        }
    }

    const isAskDisabled = loading || !videoInfo || videoInfo.status !== "COMPLETED"

    return (
        <div className="document-chat-page document-chat-page--video">
            <header className="document-chat-header">
                <div className="header-row">
                    <button className="link-button" onClick={() => navigate(-1)}>Back</button>
                    <span className="page-tag">Transcript Studio</span>
                </div>

                <div className="page-copy">
                    <p className="eyebrow">Video Analysis</p>
                    <h1>Turn a YouTube transcript into a searchable study surface.</h1>
                    <p>Paste a video link, process the transcript, then ask for summaries, claims, moments, or explanations without losing the conversation trail.</p>
                </div>

                <div className="page-summary">
                    <div className="summary-item">
                        <span>Video</span>
                        <strong>{videoInfo ? videoInfo.title || videoInfo.videoId : "No video loaded"}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Status</span>
                        <strong>{videoInfo ? videoInfo.status : "Upload required"}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Chats</span>
                        <strong>{chatHistory.length}</strong>
                    </div>
                </div>
            </header>

            <div className="document-chat-grid">
                <aside className="document-sidebar">
                    <section className="card upload-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Input</p>
                                <h2>Paste YouTube link</h2>
                            </div>
                            <span className="status-chip">Required</span>
                        </div>

                        <label htmlFor="youtube-url">YouTube URL</label>
                        <input
                            id="youtube-url"
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />

                        <div className="upload-actions">
                            <span className="upload-meta">{videoInfo ? videoInfo.videoId : "No URL processed yet"}</span>
                            <button className="button primary-button" onClick={handleUpload} disabled={loading}>Process Video</button>
                        </div>
                    </section>

                    <section className="card detail-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Active source</p>
                                <h2>Video profile</h2>
                            </div>
                            <span className="detail-status">{videoInfo ? "Loaded" : "Idle"}</span>
                        </div>

                        {videoInfo ? (
                            <div className="detail-grid">
                                <div className="detail-row"><span>Video title</span><strong>{videoInfo.title || videoInfo.videoId}</strong></div>
                                <div className="detail-row"><span>Video ID</span><strong>{videoInfo.videoId}</strong></div>
                                <div className="detail-row"><span>Chunks</span><strong>{videoInfo.totalChunks || "-"}</strong></div>
                                <div className="detail-row"><span>Processing</span><strong>{videoInfo.status}</strong></div>
                            </div>
                        ) : (
                            <p className="empty-state">Submit a video URL to view details and start the chat experience.</p>
                        )}
                    </section>

                    <section className="card hint-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Question craft</p>
                                <h2>Ask by moment</h2>
                            </div>
                        </div>
                        <ul className="hint-list">
                            <li>Ask for summaries, key moments, or explanations from the transcript.</li>
                            <li>Try "What are the main points in the first half?" or "Summarize the recommendation."</li>
                            <li>Answers become available once transcript processing is complete.</li>
                        </ul>
                    </section>
                </aside>

                <main className="document-main">
                    <section className="card ask-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Question</p>
                                <h2>Ask the transcript</h2>
                            </div>
                            <span className="status-chip">{videoInfo ? (videoInfo.status === "COMPLETED" ? "Ready" : "Processing") : "Waiting"}</span>
                        </div>

                        <label htmlFor="question-input">Write your question</label>
                        <textarea
                            id="question-input"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={videoInfo ? "Example: What are the main takeaways from the talk?" : "Process a YouTube video first."}
                            disabled={!videoInfo || loading}
                        />

                        <div className="action-row">
                            <button className="button primary-button" onClick={handleAsk} disabled={isAskDisabled}>
                                Ask video
                            </button>
                            <p className="field-help">Ask anything about the transcript once processing is complete.</p>
                        </div>
                    </section>

                    <section className="card answer-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Latest answer</p>
                                <h2>Response preview</h2>
                            </div>
                            <span className="meta-text">{lastChat ? new Date(lastChat.timestamp).toLocaleString() : "Waiting for your first question"}</span>
                        </div>

                        <div className="answer-content">
                            {lastChat ? (
                                <>
                                    <div className="answer-block"><p className="card-label">Question</p><p>{lastChat.question}</p></div>
                                    <div className="answer-block"><p className="card-label">Answer</p><p>{lastChat.answer}</p></div>
                                </>
                            ) : (
                                <p className="empty-state">You will see the latest question and answer here after asking the video.</p>
                            )}
                        </div>

                        {lastChat?.source?.length > 0 && (
                            <div className="source-panel">
                                <h3>Source preview</h3>
                                <ul>
                                    {lastChat.source.map((item, index) => (
                                        <li key={index}>Source {index + 1}: {item.metadata?.startTime ? `Start ${item.metadata.startTime}` : "Transcript segment"}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <section className="history-section">
                <div className="history-header">
                    <div>
                        <p className="eyebrow">Timeline</p>
                        <h2>Conversation trail</h2>
                    </div>
                    <p>All video questions and answers are stored here for repeat analysis and follow-up prompts.</p>
                </div>

                <div className="history-grid">
                    {chatHistory.length === 0 && <div className="history-empty">No history available yet. Ask a question to start the timeline.</div>}
                    {chatHistory.map((item) => (
                        <article key={item._id || item.createdAt} className="history-entry">
                            <div className="history-entry-top">
                                <span className="history-badge">Q&A</span>
                                <time>{new Date(item.createdAt).toLocaleString()}</time>
                            </div>
                            <div className="history-entry-block"><p className="history-entry-label">Question</p><p>{item.question}</p></div>
                            <div className="history-entry-block"><p className="history-entry-label">Answer</p><p>{item.answer}</p></div>
                        </article>
                    ))}
                </div>
            </section>

            {status && <div className="status-message">{status}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    )
}

export default YouTubeChat
