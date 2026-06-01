import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import Dashboard from "./features/interview/pages/Dashboard";
import DocumentChat from "./features/interview/pages/DocumentChat";
import YouTubeChat from "./features/interview/pages/YouTubeChat";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Dashboard /></Protected>
    },
    {
        path: "/interview-prep",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/document-chat",
        element: <Protected><DocumentChat /></Protected>
    },
    {
        path: "/youtube-chat",
        element: <Protected><YouTubeChat /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }
])