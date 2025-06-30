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
import Layout from "./components/Layout";
import "./components/RouterDomColour.css";
import Logout from "./pages/Logout.jsx";

function App() {
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
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/admin-dashboard"
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="/test-user-profile"
                        element={<TestUserProfile />}
                    />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/dvine-moments" element={<DvineMoments />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/logout" element={<Logout />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </>
    );
}

export default App;
