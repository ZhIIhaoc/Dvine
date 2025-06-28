import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes, Link, NavLink } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Register } from "./pages/Register.jsx";
import { Login } from "./pages/Login.jsx";
import { UserDashboard } from "./pages/UserDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { Catalogue } from "./pages/Catalogue.jsx";
import { DvineMoments } from "./pages/DvineMoments.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import TestUserProfile from "./pages/TestUserProfile.jsx";
import "./components/RouterDomColour.css";

function App() {
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    useEffect(() => {
        // Check if token exists in localStorage on app start
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    return (
        <>
            {/* <nav>
                <ul>
                    <li>
                        <NavLink to="/">Home</NavLink>
                    </li>
                    <li>
                        <NavLink to="/register">Register</NavLink>
                    </li>
                    <li>
                        <NavLink to="/login">Login</NavLink>
                    </li>
                    <li>
                        <NavLink to="/user-dashboard">User Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin-dashboard">Admin Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/catalogue">Catalogue</NavLink>
                    </li>
                    <li>
                        <NavLink to="/dvine-moments">Dvine Moments</NavLink>
                    </li>
                </ul>
            </nav> */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register setToken={setToken} />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/user-dashboard" element={<UserDashboard setToken={setToken} />} />
                <Route path="/admin-dashboard" element={<AdminDashboard setToken={setToken} />} />
                <Route path="/test-user-profile" element={<TestUserProfile setToken={setToken} />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/dvine-moments" element={<DvineMoments />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
