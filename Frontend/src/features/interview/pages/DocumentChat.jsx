import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { usePdfChat } from "../hooks/usePdfChat"
import "../style/document-chat.scss"

const DocumentChat = () => {
    const { documentInfo, chatHistory, loading, error, uploadDocument, askQuestion, loadHistory } = usePdfChat()
    const [selectedFile, setSelectedFile] = useState(null)
    const [question, setQuestion] = useState("")
    const [status, setStatus] = useState("")
    const [lastChat, setLastChat] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        loadHistory()
    }, [])

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.type !== "application/pdf") {
            setStatus("Please upload a valid PDF.")
            setSelectedFile(null)
            return
        }

        setSelectedFile(file)
        setStatus(`Ready to upload ${file.name}`)
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setStatus("Select a PDF file before uploading.")
            return
        }

        setStatus("Uploading the PDF, this might take a moment...")
        const response = await uploadDocument(selectedFile)

        if (response?.document?.id) {
            await loadHistory(response.document.id)
            setStatus("Upload complete. Document is now ready for questions.")
        } else {
            setStatus("Upload failed. Please try again.")
        }
    }

    const handleAsk = async () => {
        if (!documentInfo?.id) {
            setStatus("Please upload a PDF before asking questions.")
            return
        }

        if (!question.trim()) {
            setStatus("Your question cannot be empty.")
            return
        }

        setStatus("Querying your document...")
        const response = await askQuestion({ documentId: documentInfo.id, question })

        if (response?.answer) {
            setLastChat({
                question: question.trim(),
                answer: response.answer,
                source: response.source || [],
                timestamp: new Date()
            })
            setQuestion("")
            setStatus("Answer received. Scroll down for full history.")
            await loadHistory(documentInfo.id)
        } else {
            setStatus("Could not generate an answer. Please try another question.")
        }
    }

    return (
        <div className="document-chat-page">
            <header className="document-chat-header">
                <div className="header-row">
                    <button className="link-button" onClick={() => navigate(-1)}>← Back</button>
                    <span className="page-tag">PDF Intelligence</span>
                </div>

                <div className="page-copy">
                    <p className="eyebrow">Document Chat</p>
                    <h1>Ask your PDF and keep every answer in one organized place.</h1>
                    <p>Upload a PDF, submit questions in natural language, and browse the complete conversation history for the document.</p>
                </div>

                <div className="page-summary">
                    <div className="summary-item">
                        <span>Document</span>
                        <strong>{documentInfo ? documentInfo.filename || documentInfo.id : "No document loaded"}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Status</span>
                        <strong>{documentInfo ? "Ready to ask" : "Upload required"}</strong>
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
                                <p className="eyebrow">Upload</p>
                                <h2>Choose PDF</h2>
                            </div>
                            <span className="status-chip">Required</span>
                        </div>

                        <label htmlFor="pdf-upload">Select file</label>
                        <input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />

                        <div className="upload-actions">
                            <span className="upload-meta">{selectedFile ? selectedFile.name : "No file selected"}</span>
                            <button className="button primary-button" onClick={handleUpload} disabled={loading}>Upload PDF</button>
                        </div>

                        <p className="upload-hint">Only PDF files are allowed. Wait until upload finishes before asking questions.</p>
                    </section>

                    <section className="card detail-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Document details</p>
                                <h2>Active file</h2>
                            </div>
                            <span className="detail-status">{documentInfo ? "Loaded" : "Idle"}</span>
                        </div>

                        {documentInfo ? (
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <span>Document ID</span>
                                    <strong>{documentInfo.id}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Pages</span>
                                    <strong>{documentInfo.totalPages || "—"}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Chats</span>
                                    <strong>{chatHistory.length}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Created</span>
                                    <strong>{documentInfo.createdAt ? new Date(documentInfo.createdAt).toLocaleDateString() : "—"}</strong>
                                </div>
                            </div>
                        ) : (
                            <p className="empty-state">Upload a PDF to view details and start asking questions.</p>
                        )}
                    </section>

                    <section className="card hint-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Quick tips</p>
                                <h2>Ask smarter questions</h2>
                            </div>
                        </div>
                        <ul className="hint-list">
                            <li>Ask for summaries, action items, or page-specific details.</li>
                            <li>Use clear language like “What are the main points on page 10?”</li>
                            <li>Review the timeline below to repeat or refine earlier questions.</li>
                        </ul>
                    </section>
                </aside>

                <main className="document-main">
                    <section className="card ask-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Question</p>
                                <h2>Ask your document</h2>
                            </div>
                            <span className="status-chip">{documentInfo ? "Ready" : "Waiting"}</span>
                        </div>

                        <label htmlFor="question-input">Write your question</label>
                        <textarea
                            id="question-input"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={documentInfo ? "Example: What are the main takeaways from page 5?" : "Upload a PDF to enable questions."}
                            disabled={!documentInfo || loading}
                        />

                        <div className="action-row">
                            <button className="button primary-button" onClick={handleAsk} disabled={loading || !documentInfo}>
                                Ask document
                            </button>
                            <p className="field-help">Need inspiration? Ask about summaries, page details, or tasks.</p>
                        </div>
                    </section>

                    <section className="card answer-card">
                        <div className="card-head">
                            <div>
                                <p className="eyebrow">Latest answer</p>
                                <h2>Response preview</h2>
                            </div>
                            <span className="meta-text">
                                {lastChat ? new Date(lastChat.timestamp).toLocaleString() : "Waiting for your first question"}
                            </span>
                        </div>

                        <div className="answer-content">
                            {lastChat ? (
                                <>
                                    <div className="answer-block">
                                        <p className="card-label">Question</p>
                                        <p>{lastChat.question}</p>
                                    </div>
                                    <div className="answer-block">
                                        <p className="card-label">Answer</p>
                                        <p>{lastChat.answer}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="empty-state">You will see the latest question and answer here after submitting a request.</p>
                            )}
                        </div>

                        {lastChat?.source?.length > 0 && (
                            <div className="source-panel">
                                <h3>Source preview</h3>
                                <ul>
                                    {lastChat.source.map((item, index) => (
                                        <li key={index}>Source {index + 1}: {item.metadata?.pageNumber ? `Page ${item.metadata.pageNumber}` : "Unknown page"}</li>
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
                        <p className="eyebrow">History</p>
                        <h2>Conversation timeline</h2>
                    </div>
                    <p>All document questions and answers are stored here. Use the timeline to revisit past chats and current insights.</p>
                </div>

                <div className="history-grid">
                    {chatHistory.length === 0 && (
                        <div className="history-empty">No history available yet. Ask a question to start your timeline.</div>
                    )}

                    {chatHistory.map((item) => (
                        <article key={item._id || item.createdAt} className="history-entry">
                            <div className="history-entry-top">
                                <span className="history-badge">Q&A</span>
                                <time>{new Date(item.createdAt).toLocaleString()}</time>
                            </div>
                            <div className="history-entry-block">
                                <p className="history-entry-label">Question</p>
                                <p>{item.question}</p>
                            </div>
                            <div className="history-entry-block">
                                <p className="history-entry-label">Answer</p>
                                <p>{item.answer}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {status && <div className="status-message">{status}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    )
}

export default DocumentChat
