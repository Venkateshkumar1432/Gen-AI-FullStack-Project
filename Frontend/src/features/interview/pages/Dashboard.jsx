import { useNavigate } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"
import "../style/dashboard.scss"

const featureCards = [
    {
        title: "Interview Preparation",
        description: "Build a tailored interview strategy based on your resume, experience, and job description.",
        buttonText: "Start Preparing",
        path: "/interview-prep"
    },
    {
        title: "Document Chat",
        description: "Upload a PDF and ask questions to get instant answers from the document content.",
        buttonText: "Open Document Chat",
        path: "/document-chat"
    }
]

const Dashboard = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onFeatureClick = (path) => {
        navigate(path)
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-welcome">Welcome back, <strong>{user?.username || user?.email || "User"}</strong></p>
                    <h1>Choose your next step</h1>
                    <p>Pick a feature to continue: build your interview prep plan or ask questions from a PDF document.</p>
                </div>
                <button onClick={handleLogout} className="button secondary-button">Logout</button>
            </header>

            <div className="dashboard-grid">
                {featureCards.map((card) => (
                    <article key={card.title} className="feature-card">
                        <div className="feature-card__icon">{card.title === "Interview Preparation" ? "🎯" : "📄"}</div>
                        <h2>{card.title}</h2>
                        <p>{card.description}</p>
                        <button onClick={() => onFeatureClick(card.path)} className="button primary-button">{card.buttonText}</button>
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
