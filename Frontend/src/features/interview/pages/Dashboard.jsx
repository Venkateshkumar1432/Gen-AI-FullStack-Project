import { useNavigate } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"
import "../style/dashboard.scss"

const featureCards = [
    {
        title: "Role Fit Lab",
        description: "Turn a job brief, resume, and profile notes into a precise interview strategy.",
        buttonText: "Build plan",
        path: "/interview-prep",
        icon: "01",
        meta: "Resume + JD",
        accent: "coral"
    },
    {
        title: "Document Desk",
        description: "Interrogate a PDF, surface page-backed answers, and keep a reusable timeline.",
        buttonText: "Open desk",
        path: "/document-chat",
        icon: "02",
        meta: "PDF Q&A",
        accent: "teal"
    },
    {
        title: "Transcript Studio",
        description: "Process a video transcript and extract the ideas, claims, and moments that matter.",
        buttonText: "Analyze video",
        path: "/youtube-chat",
        icon: "03",
        meta: "Video RAG",
        accent: "amber"
    }
]

const Dashboard = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-hero">
                    <p className="dashboard-welcome">Workspace online for <strong>{user?.username || user?.email || "User"}</strong></p>
                    <h1>Pick an intelligence lane and start working.</h1>
                    <p>One cockpit for interview prep, document research, and video transcript analysis. Each lane keeps the workflow focused and fast.</p>
                </div>
                <div className="dashboard-actions">
                    <span className="dashboard-pulse">Ready</span>
                    <button onClick={handleLogout} className="button secondary-button">Logout</button>
                </div>
            </header>

            <section className="dashboard-strip" aria-label="Workspace summary">
                <div>
                    <span>Modes</span>
                    <strong>3</strong>
                </div>
                <div>
                    <span>Flow</span>
                    <strong>Upload, ask, refine</strong>
                </div>
                <div>
                    <span>Output</span>
                    <strong>Plans and answers</strong>
                </div>
            </section>

            <div className="dashboard-grid">
                {featureCards.map((card) => (
                    <article key={card.title} className={`feature-card feature-card--${card.accent}`}>
                        <div className="feature-card__top">
                            <span className="feature-card__icon">{card.icon}</span>
                            <span className="feature-card__meta">{card.meta}</span>
                        </div>
                        <div className="feature-card__copy">
                            <h2>{card.title}</h2>
                            <p>{card.description}</p>
                        </div>
                        <button onClick={() => navigate(card.path)} className="button primary-button">{card.buttonText}</button>
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
