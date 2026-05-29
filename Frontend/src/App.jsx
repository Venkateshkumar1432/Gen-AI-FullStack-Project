import { useEffect, useState } from "react"
import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"

function App() {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem("theme") || "dark"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <AuthProvider>
      <InterviewProvider>
        <div className="app-shell">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <RouterProvider router={router} />
        </div>
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App
