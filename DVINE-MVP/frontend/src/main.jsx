import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./components/AuthProvider";

// Global fetch override for JWT token handling
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
    let token = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    // Clone headers to avoid mutating input
    let headers = { ...(init.headers || {}) };
    if (token) {
        headers['Authorization'] = token;
    }
    // Only set Content-Type if not already set and not a FormData request
    if (!headers['Content-Type'] && !(init.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const fetchInit = { ...init, headers };
    let response = await originalFetch(input, fetchInit);
    // Only try refresh if token exists and got 401
    if (response.status === 401 && token && refreshToken) {
        try {
            // Try refresh
            const refreshResp = await originalFetch('http://localhost:8080/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            const refreshData = await refreshResp.json();
            if (refreshData.code === 0 && refreshData.data) {
                // Save new tokens
                localStorage.setItem('accessToken', refreshData.data.accessToken);
                localStorage.setItem('refreshToken', refreshData.data.refreshToken);
                token = refreshData.data.accessToken;
                // Retry original request with new token
                headers['Authorization'] = token;
                // Preserve original headers for retry, especially for FormData
                const retryHeaders = { ...(init.headers || {}) };
                retryHeaders['Authorization'] = token;
                const retryInit = { ...init, headers: retryHeaders };
                response = await originalFetch(input, retryInit);
                return response;
            } else {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('Email');
                window.location.href = '/login';
                return response;
            }
        } catch (e) {
            // Network or other error, clear tokens and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('Email');
            window.location.href = '/login';
            return response;
        }
    }
    return response;
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <CssBaseline />
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
