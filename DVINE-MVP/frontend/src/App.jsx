import "./App.css";
import { Route, Routes, Link, NavLink } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Register } from "./pages/Register.jsx";
import { Login } from "./pages/Login.jsx";
import { UserDashboard } from "./pages/UserDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { Catalogue } from "./pages/Catalogue.jsx";
import { DvineMoments } from "./pages/DvineMoments.jsx";
import TourDetails from "./pages/TourDetails.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import {CurrentUploadedTours} from "./pages/CurrentUploadedTours.jsx";
import {AdminTourPage} from "./pages/AdminTourPage.jsx";
import TestUserProfile from "./pages/TestUserProfile.jsx";
import Layout from "./components/Layout";
import "./components/RouterDomColour.css";
import Logout from "./pages/Logout.jsx";
import UserSettings from "./pages/UserSettings.jsx";

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
                    <Route path="/dvine-moments" element={<DvineMoments />} />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/user/settings" element={<UserSettings />} />
                    <Route path="/tour/:id" element={<TourDetails />} />
                    <Route path="/uploaded-tours" element={<CurrentUploadedTours />} />
                    <Route path="admin-tour-approval" element={<AdminTourPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </>
    );
}

export default App;
