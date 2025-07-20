import "./App.css";
import { Route, Routes, Link, NavLink } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Register } from "./pages/Register.jsx";
import { Login } from "./pages/Login.jsx";
import { UserDashboard } from "./pages/UserDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { Catalogue } from "./pages/Catalogue.jsx";
import { DvineMoments } from "./pages/DvineMoments.jsx";
import { FAQ } from "./pages/FAQ.jsx";
import TourPurchasesSuccess from "./pages/TourPurchasesSuccess.jsx";
import TourPurchaseFail from "./pages/TourPurchaseFail.jsx";
import TourDetails from "./pages/TourDetails.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { CurrentUploadedTours } from "./pages/CurrentUploadedTours.jsx";
import { AdminTourPage } from "./pages/AdminTourPage.jsx";
import ForgottenPassword from "./pages/ForgottenPassword.jsx";
import TestUserProfile from "./pages/TestUserProfile.jsx";
import Layout from "./components/Layout";
import "./components/RouterDomColour.css";
import Logout from "./pages/Logout.jsx";
import UserSettings from "./pages/UserSettings.jsx";
import { lightTheme, darkTheme } from "./theme";
import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("themeMode");
        if (saved) setIsDarkMode(saved === "dark");
    }, []);

    useEffect(() => {
        localStorage.setItem("themeMode", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    return (
        <>
            <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                <CssBaseline />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Layout
                                isDarkMode={isDarkMode}
                                setIsDarkMode={setIsDarkMode}
                            />
                        }
                    >
                        <Route index path="/" element={<Home />} />
                        <Route
                            path="/admin-dashboard"
                            element={<AdminDashboard />}
                        />
                        <Route
                            path="/test-user-profile"
                            element={<TestUserProfile />}
                        />
                        <Route path="/catalogue" element={<Catalogue />} />
                        <Route
                            path="/dvine-moments"
                            element={<DvineMoments />}
                        />
                        <Route path="/faq" element={<FAQ />} />
                        <Route
                            path="/user-dashboard"
                            element={<UserDashboard />}
                        />
                        <Route path="/logout" element={<Logout />} />
                        <Route
                            path="/user/settings"
                            element={<UserSettings />}
                        />
                        <Route path="/tour/:id" element={<TourDetails />} />
                        <Route
                            path="/uploaded-tours"
                            element={<CurrentUploadedTours />}
                        />
                        <Route
                            path="/booking/success/:id"
                            element={<TourPurchasesSuccess />}
                        />
                        <Route
                            path="/booking/cancel/:id"
                            element={<TourPurchaseFail />}
                        />
                        <Route
                            path="/password-reset"
                            element={<ForgottenPassword />}
                        />
                        <Route
                            path="admin-tour-approval"
                            element={<AdminTourPage />}
                        />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route
                        path="/login"
                        element={<Login isDarkMode={isDarkMode} />}
                    />
                    <Route
                        path="/register"
                        element={<Register isDarkMode={isDarkMode} />}
                    />
                </Routes>
            </ThemeProvider>
        </>
    );
}

export default App;
